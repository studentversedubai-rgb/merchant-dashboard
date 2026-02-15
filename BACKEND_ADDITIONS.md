# Backend Additions for Merchant Validation

## Overview
This document outlines the backend changes needed to support merchant PIN validation and redemption confirmation.

## Database Migration

### 1. Create merchant_pins table

```sql
-- Migration: Add merchant_pins table
-- File: migrations/add_merchant_pins.sql

create table merchant_pins (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade,
  pin_hash text not null,
  valid_from timestamptz default now(),
  valid_until timestamptz not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Index for faster lookups
create index idx_merchant_pins_merchant_id on merchant_pins(merchant_id);
create index idx_merchant_pins_active on merchant_pins(merchant_id, is_active) where is_active = true;
```

### 2. Optional: Add commission_amount to redemptions

```sql
-- Migration: Add commission tracking (optional)
-- File: migrations/add_commission_to_redemptions.sql

alter table redemptions 
add column if not exists commission_amount decimal(10,2);

comment on column redemptions.commission_amount is 'Commission earned by merchant on this redemption';
```

## API Endpoint Updates

### POST /entitlements/confirm

**Purpose**: Confirm entitlement redemption with merchant PIN validation

**Request Body**:
```json
{
  "entitlement_id": "uuid",
  "merchant_pin": "string (4-6 digits)",
  "total_amount": "decimal",
  "discount_amount": "decimal"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "redemption_id": "uuid",
  "message": "Redemption confirmed successfully",
  "details": {
    "total_amount": 100.00,
    "discount_amount": 20.00,
    "final_amount": 80.00,
    "commission_amount": 2.00
  }
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Invalid PIN" | "Entitlement already used" | "Entitlement not found"
}
```

## Security Requirements

1. **PIN Hashing**: Use bcrypt with salt rounds = 10
2. **Rate Limiting**: Max 3 failed PIN attempts per merchant per 15 minutes
3. **State Validation**: Only allow confirmation for `pending_confirmation` entitlements
4. **Duplicate Prevention**: Check if entitlement already has a redemption record

## Implementation Checklist

- [ ] Create merchant_pins migration
- [ ] Add commission_amount column to redemptions (optional)
- [ ] Install bcrypt dependency
- [ ] Create PIN validation service
- [ ] Update entitlements/confirm endpoint
- [ ] Add rate limiting middleware
- [ ] Update CORS for merchant.studentverse.app
- [ ] Add error logging
- [ ] Write integration tests
