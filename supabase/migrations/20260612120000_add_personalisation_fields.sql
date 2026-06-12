-- Add personalisation fields to the profiles table.
-- Both columns are additive and safe to run against an existing database.
-- Existing rows receive sensible defaults automatically.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS support_notes        TEXT,
  ADD COLUMN IF NOT EXISTS preferred_step_count INTEGER NOT NULL DEFAULT 5
    CHECK (preferred_step_count BETWEEN 3 AND 10);
