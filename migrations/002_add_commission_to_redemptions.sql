-- Migration: Add commission tracking to redemptions table
-- Created: 2026-02-15
-- Description: Optional column to track merchant commission on redemptions

-- Add commission_amount column (if it doesn't exist)
alter table redemptions 
add column if not exists commission_amount decimal(10,2);

-- Add constraint to ensure non-negative commission
alter table redemptions
add constraint if not exists check_commission_non_negative 
  check (commission_amount is null or commission_amount >= 0);

-- Comment for documentation
comment on column redemptions.commission_amount is 'Commission amount earned by merchant on this redemption (optional)';
