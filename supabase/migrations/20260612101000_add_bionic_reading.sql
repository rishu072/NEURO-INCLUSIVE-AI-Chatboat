-- Add bionic_reading preference column to the profiles table.
-- Existing rows default to false so no data migration is required.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bionic_reading BOOLEAN NOT NULL DEFAULT false;
