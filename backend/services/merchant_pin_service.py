"""
Merchant PIN Validation Service
Handles secure PIN verification for entitlement confirmations
"""

import bcrypt
from datetime import datetime, timezone
from typing import Optional, Tuple
from supabase import Client

class MerchantPINService:
    """Service for validating merchant PINs"""
    
    def __init__(self, supabase_client: Client, redis_client):
        self.supabase = supabase_client
        self.redis = redis_client
        self.SALT_ROUNDS = 10
        self.MAX_ATTEMPTS = 3
        self.LOCKOUT_DURATION = 900  # 15 minutes in seconds
    
    def hash_pin(self, pin: str) -> str:
        """
        Hash a PIN using bcrypt
        
        Args:
            pin: Plain text PIN (4-6 digits)
            
        Returns:
            Bcrypt hash of the PIN
        """
        pin_bytes = pin.encode('utf-8')
        salt = bcrypt.gensalt(rounds=self.SALT_ROUNDS)
        hashed = bcrypt.hashpw(pin_bytes, salt)
        return hashed.decode('utf-8')
    
    def verify_pin(self, pin: str, pin_hash: str) -> bool:
        """
        Verify a PIN against its hash
        
        Args:
            pin: Plain text PIN to verify
            pin_hash: Stored bcrypt hash
            
        Returns:
            True if PIN matches, False otherwise
        """
        try:
            pin_bytes = pin.encode('utf-8')
            hash_bytes = pin_hash.encode('utf-8')
            return bcrypt.checkpw(pin_bytes, hash_bytes)
        except Exception:
            return False
    
    def get_active_pin(self, merchant_id: str) -> Optional[dict]:
        """
        Get the active PIN for a merchant
        
        Args:
            merchant_id: UUID of the merchant
            
        Returns:
            PIN record dict or None if no active PIN found
        """
        now = datetime.now(timezone.utc).isoformat()
        
        response = self.supabase.table('merchant_pins').select('*').eq(
            'merchant_id', merchant_id
        ).eq(
            'is_active', True
        ).lte(
            'valid_from', now
        ).gte(
            'valid_until', now
        ).order('created_at', desc=True).limit(1).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    
    def check_rate_limit(self, merchant_id: str) -> Tuple[bool, int]:
        """
        Check if merchant has exceeded PIN attempt rate limit
        
        Args:
            merchant_id: UUID of the merchant
            
        Returns:
            Tuple of (is_allowed: bool, attempts_remaining: int)
        """
        key = f"pin_attempts:{merchant_id}"
        attempts = self.redis.get(key)
        
        if attempts is None:
            return True, self.MAX_ATTEMPTS
        
        attempts = int(attempts)
        if attempts >= self.MAX_ATTEMPTS:
            ttl = self.redis.ttl(key)
            return False, 0
        
        return True, self.MAX_ATTEMPTS - attempts
    
    def record_failed_attempt(self, merchant_id: str) -> int:
        """
        Record a failed PIN attempt
        
        Args:
            merchant_id: UUID of the merchant
            
        Returns:
            Number of failed attempts
        """
        key = f"pin_attempts:{merchant_id}"
        attempts = self.redis.incr(key)
        
        # Set expiry on first attempt
        if attempts == 1:
            self.redis.expire(key, self.LOCKOUT_DURATION)
        
        return attempts
    
    def reset_attempts(self, merchant_id: str):
        """
        Reset failed PIN attempts for a merchant
        
        Args:
            merchant_id: UUID of the merchant
        """
        key = f"pin_attempts:{merchant_id}"
        self.redis.delete(key)
    
    def validate_merchant_pin(
        self, 
        merchant_id: str, 
        pin: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate a merchant's PIN with rate limiting
        
        Args:
            merchant_id: UUID of the merchant
            pin: Plain text PIN to validate
            
        Returns:
            Tuple of (is_valid: bool, error_message: Optional[str])
        """
        # Check rate limit
        is_allowed, attempts_remaining = self.check_rate_limit(merchant_id)
        if not is_allowed:
            return False, "Too many failed attempts. Please try again in 15 minutes."
        
        # Get active PIN
        pin_record = self.get_active_pin(merchant_id)
        if not pin_record:
            self.record_failed_attempt(merchant_id)
            return False, "Invalid PIN"
        
        # Verify PIN
        is_valid = self.verify_pin(pin, pin_record['pin_hash'])
        
        if is_valid:
            # Reset attempts on success
            self.reset_attempts(merchant_id)
            return True, None
        else:
            # Record failed attempt
            attempts = self.record_failed_attempt(merchant_id)
            remaining = self.MAX_ATTEMPTS - attempts
            
            if remaining > 0:
                return False, f"Invalid PIN. {remaining} attempts remaining."
            else:
                return False, "Too many failed attempts. Account locked for 15 minutes."
