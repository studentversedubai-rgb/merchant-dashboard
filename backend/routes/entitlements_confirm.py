"""
Updated Entitlements Confirmation Endpoint
Adds merchant PIN validation and redemption recording
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field, validator
from typing import Optional
from decimal import Decimal
from datetime import datetime, timezone
import uuid

from app.core.database import get_supabase_client
from app.core.redis import get_redis_client
from services.merchant_pin_service import MerchantPINService

router = APIRouter(prefix="/entitlements", tags=["entitlements"])


class ConfirmEntitlementRequest(BaseModel):
    """Request model for entitlement confirmation"""
    entitlement_id: str = Field(..., description="UUID of the entitlement to confirm")
    merchant_pin: str = Field(..., min_length=4, max_length=6, description="Merchant PIN")
    total_amount: Decimal = Field(..., gt=0, description="Total transaction amount")
    discount_amount: Decimal = Field(..., ge=0, description="Discount amount applied")
    
    @validator('merchant_pin')
    def validate_pin_format(cls, v):
        if not v.isdigit():
            raise ValueError('PIN must contain only digits')
        return v
    
    @validator('discount_amount')
    def validate_discount(cls, v, values):
        if 'total_amount' in values and v > values['total_amount']:
            raise ValueError('Discount cannot exceed total amount')
        return v


class ConfirmEntitlementResponse(BaseModel):
    """Response model for successful confirmation"""
    success: bool
    redemption_id: str
    message: str
    details: dict


@router.post("/confirm", response_model=ConfirmEntitlementResponse)
async def confirm_entitlement(
    request: ConfirmEntitlementRequest,
    supabase=Depends(get_supabase_client),
    redis=Depends(get_redis_client)
):
    """
    Confirm entitlement redemption with merchant PIN validation
    
    Flow:
    1. Validate entitlement exists and is in pending_confirmation state
    2. Verify merchant PIN
    3. Check for duplicate redemptions
    4. Create redemption record
    5. Mark entitlement as used
    6. Return confirmation details
    
    Security:
    - PIN is validated server-side only
    - Rate limiting on failed PIN attempts
    - Prevents duplicate confirmations
    """
    
    # Step 1: Fetch and validate entitlement
    entitlement_response = supabase.table('entitlements').select(
        '*, offers(merchant_id, discount_percentage, commission_rate)'
    ).eq('id', request.entitlement_id).single().execute()
    
    if not entitlement_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entitlement not found"
        )
    
    entitlement = entitlement_response.data
    
    # Validate state
    if entitlement['state'] != 'pending_confirmation':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Entitlement is not pending confirmation (current state: {entitlement['state']})"
        )
    
    # Check if already redeemed
    existing_redemption = supabase.table('redemptions').select('id').eq(
        'entitlement_id', request.entitlement_id
    ).execute()
    
    if existing_redemption.data and len(existing_redemption.data) > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Entitlement has already been redeemed"
        )
    
    # Step 2: Validate merchant PIN
    merchant_id = entitlement['offers']['merchant_id']
    pin_service = MerchantPINService(supabase, redis)
    
    is_valid, error_message = pin_service.validate_merchant_pin(
        merchant_id=merchant_id,
        pin=request.merchant_pin
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_message or "Invalid PIN"
        )
    
    # Step 3: Calculate amounts
    final_amount = request.total_amount - request.discount_amount
    
    # Optional: Calculate commission (if commission_rate exists)
    commission_amount = None
    if entitlement['offers'].get('commission_rate'):
        commission_rate = Decimal(str(entitlement['offers']['commission_rate']))
        commission_amount = (request.discount_amount * commission_rate / 100).quantize(
            Decimal('0.01')
        )
    
    # Step 4: Create redemption record
    redemption_data = {
        'id': str(uuid.uuid4()),
        'entitlement_id': request.entitlement_id,
        'merchant_id': merchant_id,
        'user_id': entitlement['user_id'],
        'offer_id': entitlement['offer_id'],
        'total_amount': float(request.total_amount),
        'discount_amount': float(request.discount_amount),
        'final_amount': float(final_amount),
        'commission_amount': float(commission_amount) if commission_amount else None,
        'redeemed_at': datetime.now(timezone.utc).isoformat(),
        'status': 'completed'
    }
    
    redemption_response = supabase.table('redemptions').insert(
        redemption_data
    ).execute()
    
    if not redemption_response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create redemption record"
        )
    
    # Step 5: Mark entitlement as used
    update_response = supabase.table('entitlements').update({
        'state': 'used',
        'used_at': datetime.now(timezone.utc).isoformat()
    }).eq('id', request.entitlement_id).execute()
    
    if not update_response.data:
        # Rollback redemption if entitlement update fails
        supabase.table('redemptions').delete().eq(
            'id', redemption_data['id']
        ).execute()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update entitlement status"
        )
    
    # Step 6: Return success response
    return ConfirmEntitlementResponse(
        success=True,
        redemption_id=redemption_data['id'],
        message="Redemption confirmed successfully",
        details={
            "total_amount": float(request.total_amount),
            "discount_amount": float(request.discount_amount),
            "final_amount": float(final_amount),
            "commission_amount": float(commission_amount) if commission_amount else None,
            "redeemed_at": redemption_data['redeemed_at']
        }
    )
