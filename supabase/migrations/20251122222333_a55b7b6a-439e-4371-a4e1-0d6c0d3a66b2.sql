-- Add team fee tracking columns to game_sessions
ALTER TABLE public.game_sessions
ADD COLUMN IF NOT EXISTS team_fee_amount numeric,
ADD COLUMN IF NOT EXISTS winner_amount numeric;