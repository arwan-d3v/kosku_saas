-- Add new profile fields to the users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS university TEXT,
ADD COLUMN IF NOT EXISTS domicile_address TEXT;
