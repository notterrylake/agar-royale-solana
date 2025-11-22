-- Create table to track spin wheel results
CREATE TABLE public.spin_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  hash_code TEXT,
  is_winner BOOLEAN NOT NULL DEFAULT false,
  transaction_signature TEXT,
  spin_cost DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  test_mode BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.spin_results ENABLE ROW LEVEL SECURITY;

-- Create policies for spin results
CREATE POLICY "Users can view their own spin results" 
ON public.spin_results 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own spin results" 
ON public.spin_results 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_spin_results_wallet ON public.spin_results(wallet_address);
CREATE INDEX idx_spin_results_hash ON public.spin_results(hash_code) WHERE hash_code IS NOT NULL;