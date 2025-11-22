import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "npm:@solana/web3.js@1.98.4";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, winnerId, winnerWallet, potAmount } = await req.json();
    
    console.log('Processing payout:', { sessionId, winnerId, winnerWallet, potAmount });

    if (!sessionId || !winnerId || !winnerWallet || !potAmount) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the session and winner
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*, players(*)')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('Session not found:', sessionError);
      return new Response(
        JSON.stringify({ success: false, error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify winner exists in this session
    const winner = session.players?.find((p: any) => p.id === winnerId);
    if (!winner || winner.wallet_address !== winnerWallet) {
      console.error('Winner verification failed');
      return new Response(
        JSON.stringify({ success: false, error: 'Winner verification failed' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if payout already processed
    if (session.payout_signature) {
      console.log('Payout already processed');
      return new Response(
        JSON.stringify({ 
          success: true, 
          signature: session.payout_signature,
          alreadyProcessed: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For demo purposes, we'll simulate the payout
    // In production, you would need to:
    // 1. Store treasury wallet private key in Supabase secrets
    // 2. Create and sign the transfer transaction
    // 3. Send it to the network
    
    console.log('Simulating payout transaction...');
    
    // Simulate transaction signature
    const mockSignature = `payout_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Update session with payout info
    const { error: updateError } = await supabase
      .from('game_sessions')
      .update({
        payout_signature: mockSignature,
        payout_processed_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Failed to update session:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payout processed successfully');
    return new Response(
      JSON.stringify({ 
        success: true,
        signature: mockSignature,
        amount: potAmount,
        recipient: winnerWallet
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing payout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});