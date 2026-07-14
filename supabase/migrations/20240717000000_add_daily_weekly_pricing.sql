-- Migration to add daily and weekly custom pricing options to rooms

ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS price_per_day DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_per_week DECIMAL(12, 2) DEFAULT 0;
