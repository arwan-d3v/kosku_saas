-- Add DP options to rooms
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS allow_dp_10 BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_dp_25 BOOLEAN DEFAULT false;

-- Create Enum for Payment Type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type') THEN
        CREATE TYPE payment_type AS ENUM ('FULL', 'DP_10', 'DP_25');
    END IF;
END$$;

-- Add payment type and expiry to bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS payment_type payment_type DEFAULT 'FULL'::payment_type,
ADD COLUMN IF NOT EXISTS dp_amount DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS dp_expires_at TIMESTAMP WITH TIME ZONE;
