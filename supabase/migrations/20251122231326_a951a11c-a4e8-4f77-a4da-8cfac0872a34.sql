-- Drop existing overly permissive policies on players table
DROP POLICY IF EXISTS "Anyone can create players" ON public.players;
DROP POLICY IF EXISTS "Anyone can update players" ON public.players;
DROP POLICY IF EXISTS "Anyone can delete players" ON public.players;
DROP POLICY IF EXISTS "Anyone can view players" ON public.players;

-- Create secure policies for players table
-- Allow public viewing (needed for game lobby and spectating)
CREATE POLICY "Anyone can view players" 
ON public.players 
FOR SELECT 
USING (true);

-- Only allow service role (edge functions) to insert players
-- This forces player creation through authenticated edge functions
CREATE POLICY "Only service role can insert players" 
ON public.players 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Only allow service role (edge functions) to update players
-- This prevents clients from manipulating scores, positions, or wallet addresses
CREATE POLICY "Only service role can update players" 
ON public.players 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- Only allow service role (edge functions) to delete players
-- This prevents clients from removing competitors
CREATE POLICY "Only service role can delete players" 
ON public.players 
FOR DELETE 
USING (auth.role() = 'service_role');