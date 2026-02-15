-- Migration: Add merchant_pins table for PIN-based validation
-- Created: 2026-02-15
-- Description: Merchants use PINs to confirm entitlement redemptions

-- Create merchant_pins table
create table if not exists merchant_pins (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  pin_hash text not null,
  valid_from timestamptz default now(),
  valid_until timestamptz not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  
  -- Constraints
  constraint valid_date_range check (valid_until > valid_from)
);

-- Indexes for performance
create index if not exists idx_merchant_pins_merchant_id 
  on merchant_pins(merchant_id);

create index if not exists idx_merchant_pins_active 
  on merchant_pins(merchant_id, is_active) 
  where is_active = true;

-- Comments for documentation
comment on table merchant_pins is 'Stores hashed PINs for merchant validation of entitlement redemptions';
comment on column merchant_pins.pin_hash is 'Bcrypt hash of the merchant PIN';
comment on column merchant_pins.valid_from is 'PIN becomes valid from this timestamp';
comment on column merchant_pins.valid_until is 'PIN expires after this timestamp';
comment on column merchant_pins.is_active is 'Soft delete flag - inactive PINs cannot be used';
