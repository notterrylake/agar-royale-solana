-- Add betting and lobby columns to game_sessions table
ALTER TABLE public.game_sessions
ADD COLUMN IF NOT EXISTS bet_amount numeric DEFAULT 0.05,
ADD COLUMN IF NOT EXISTS pot_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS required_players integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS lobby_start_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS game_start_countdown timestamp with time zone;

-- Add payment verification columns to players table
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS bet_transaction_signature text,
ADD COLUMN IF NOT EXISTS has_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS skin_id integer;