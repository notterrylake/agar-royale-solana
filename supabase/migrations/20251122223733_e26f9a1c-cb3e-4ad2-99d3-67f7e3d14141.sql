-- Create matchmaking queue table
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name text NOT NULL,
  wallet_address text NOT NULL,
  bet_transaction_signature text NOT NULL,
  skin_id integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'searching' CHECK (status IN ('searching', 'matched', 'cancelled'))
);

-- Enable RLS
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view queue
CREATE POLICY "Anyone can view matchmaking queue"
ON public.matchmaking_queue
FOR SELECT
USING (true);

-- Allow anyone to join queue
CREATE POLICY "Anyone can join matchmaking queue"
ON public.matchmaking_queue
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update queue
CREATE POLICY "Anyone can update matchmaking queue"
ON public.matchmaking_queue
FOR UPDATE
USING (true);

-- Allow anyone to leave queue
CREATE POLICY "Anyone can delete from matchmaking queue"
ON public.matchmaking_queue
FOR DELETE
USING (true);

-- Add index for performance
CREATE INDEX idx_matchmaking_queue_status ON public.matchmaking_queue(status, created_at);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;