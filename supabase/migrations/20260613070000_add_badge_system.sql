-- Add badge system and stats tracking columns to profiles.
-- All additions are idempotent (IF NOT EXISTS / DEFAULT).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS badges_earned          TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS total_microwins_completed INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_goals_completed   INTEGER NOT NULL DEFAULT 0;
