"""
Utility script to generate merchant PINs
Usage: python generate_pin.py <merchant_id> <pin>
"""

import sys
import bcrypt
from datetime import datetime, timedelta

def generate_pin_hash(pin: str) -> str:
    """Generate bcrypt hash for a PIN"""
    pin_bytes = pin.encode('utf-8')
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(pin_bytes, salt)
    return hashed.decode('utf-8')

def generate_sql_insert(merchant_id: str, pin: str, valid_days: int = 365) -> str:
    """Generate SQL INSERT statement for merchant PIN"""
    pin_hash = generate_pin_hash(pin)
    valid_until = datetime.now() + timedelta(days=valid_days)
    
    sql = f"""
-- Insert merchant PIN for merchant {merchant_id}
INSERT INTO merchant_pins (merchant_id, pin_hash, valid_until, is_active)
VALUES (
    '{merchant_id}',
    '{pin_hash}',
    '{valid_until.isoformat()}',
    true
);
"""
    return sql

def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_pin.py <merchant_id> <pin> [valid_days]")
        print("Example: python generate_pin.py 123e4567-e89b-12d3-a456-426614174000 1234 365")
        sys.exit(1)
    
    merchant_id = sys.argv[1]
    pin = sys.argv[2]
    valid_days = int(sys.argv[3]) if len(sys.argv) > 3 else 365
    
    # Validate PIN
    if not pin.isdigit():
        print("Error: PIN must contain only digits")
        sys.exit(1)
    
    if len(pin) < 4 or len(pin) > 6:
        print("Error: PIN must be 4-6 digits")
        sys.exit(1)
    
    # Generate hash
    pin_hash = generate_pin_hash(pin)
    
    print("\n" + "="*60)
    print("MERCHANT PIN GENERATED")
    print("="*60)
    print(f"Merchant ID: {merchant_id}")
    print(f"PIN (DO NOT SHARE): {pin}")
    print(f"PIN Hash: {pin_hash}")
    print(f"Valid for: {valid_days} days")
    print("="*60)
    
    # Generate SQL
    sql = generate_sql_insert(merchant_id, pin, valid_days)
    print("\nSQL INSERT Statement:")
    print(sql)
    
    # Save to file
    filename = f"merchant_pin_{merchant_id[:8]}.sql"
    with open(filename, 'w') as f:
        f.write(sql)
    
    print(f"\nSQL saved to: {filename}")
    print("\nIMPORTANT: Keep the PIN secure and share only with the merchant!")

if __name__ == "__main__":
    main()
