-- Add payout and refund columns to game_sessions
ALTER TABLE public.game_sessions
ADD COLUMN IF NOT EXISTS payout_signature text,
ADD COLUMN IF NOT EXISTS payout_processed_at timestamp with time zone;

-- Add refund columns to players
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS refund_signature text,
ADD COLUMN IF NOT EXISTS refund_processed_at timestamp with time zone;

-- Add unique constraint to prevent duplicate wallets in same session
CREATE UNIQUE INDEX IF NOT EXISTS unique_wallet_per_session 
ON public.players(session_id, wallet_address) 
WHERE wallet_address IS NOT NULL;

-- Add unique constraint to prevent transaction signature reuse
CREATE UNIQUE INDEX IF NOT EXISTS unique_transaction_signature 
ON public.players(bet_transaction_signature) 
WHERE bet_transaction_signature IS NOT NULL;