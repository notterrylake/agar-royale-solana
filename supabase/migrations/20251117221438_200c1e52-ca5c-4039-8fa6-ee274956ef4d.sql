-- Create game sessions table
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT UNIQUE NOT NULL,
  max_players INTEGER DEFAULT 50,
  win_condition_food INTEGER DEFAULT 100,
  status TEXT DEFAULT 'waiting',
  winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create players table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  wallet_address TEXT,
  score REAL DEFAULT 0,
  is_alive BOOLEAN DEFAULT true,
  position_x REAL,
  position_y REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can read/write for this multiplayer game)
CREATE POLICY "Anyone can view game sessions"
  ON public.game_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create game sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update game sessions"
  ON public.game_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can view players"
  ON public.players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create players"
  ON public.players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update players"
  ON public.players FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete players"
  ON public.players FOR DELETE
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;

-- Create index for better performance
CREATE INDEX idx_players_session ON public.players(session_id);
CREATE INDEX idx_players_score ON public.players(score DESC);
CREATE INDEX idx_sessions_status ON public.game_sessions(status);