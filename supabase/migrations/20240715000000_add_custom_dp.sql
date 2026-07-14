-- Migration to add Custom DP support

-- 1. Add CUSTOM_DP to payment_type enum
ALTER TYPE payment_type ADD VALUE IF NOT EXISTS 'CUSTOM_DP';

-- 2. Add columns to rooms table
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS allow_custom_dp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_dp_percentage DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS custom_dp_duration_hours INTEGER;

-- 3. Add balance_paid to bookings table to track settlement
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS balance_paid BOOLEAN DEFAULT false;
