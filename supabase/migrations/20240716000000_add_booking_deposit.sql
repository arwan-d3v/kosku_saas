-- Migration to add Auto-Renewal Deposit feature to bookings

-- 1. Add deposit balance and auto-renewal flag to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS auto_renewal_deposit DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_renewal_enabled BOOLEAN DEFAULT false;
