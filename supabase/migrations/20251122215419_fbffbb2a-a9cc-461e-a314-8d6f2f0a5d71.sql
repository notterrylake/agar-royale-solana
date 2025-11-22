-- Add last_game_ended_at column to track when players finish games
ALTER TABLE public.players 
ADD COLUMN last_game_ended_at timestamp with time zone;