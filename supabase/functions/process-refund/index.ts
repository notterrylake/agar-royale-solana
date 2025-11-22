import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { playerId, sessionId } = await req.json();
    
    console.log('Processing refund:', { playerId, sessionId });

    if (!playerId || !sessionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get player and session info
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*, game_sessions(*)')
      .eq('id', playerId)
      .eq('session_id', sessionId)
      .single();

    if (playerError || !player) {
      console.error('Player not found:', playerError);
      return new Response(
        JSON.stringify({ success: false, error: 'Player not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify game hasn't started
    if (player.game_sessions.status !== 'waiting') {
      console.error('Game already started, cannot refund');
      return new Response(
        JSON.stringify({ success: false, error: 'Game already started, refunds not available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify player has paid
    if (!player.has_paid || !player.bet_transaction_signature) {
      console.error('Player has not paid');
      return new Response(
        JSON.stringify({ success: false, error: 'No payment to refund' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For demo purposes, simulate the refund
    // In production, you would:
    // 1. Create a transfer transaction from treasury to player wallet
    // 2. Sign and send it
    const mockRefundSignature = `refund_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    console.log('Simulating refund transaction...');

    // Update player record
    const { error: updatePlayerError } = await supabase
      .from('players')
      .update({
        refund_signature: mockRefundSignature,
        refund_processed_at: new Date().toISOString()
      })
      .eq('id', playerId);

    if (updatePlayerError) {
      console.error('Failed to update player:', updatePlayerError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process refund' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update pot amount in session
    const currentPot = player.game_sessions.pot_amount || 0;
    const { error: updateSessionError } = await supabase
      .from('game_sessions')
      .update({
        pot_amount: Math.max(0, currentPot - 0.05)
      })
      .eq('id', sessionId);

    if (updateSessionError) {
      console.error('Failed to update session pot:', updateSessionError);
    }

    // Delete the player from the session
    const { error: deleteError } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (deleteError) {
      console.error('Failed to delete player:', deleteError);
    }

    console.log('Refund processed successfully');
    return new Response(
      JSON.stringify({ 
        success: true,
        refundSignature: mockRefundSignature,
        amount: 0.05,
        recipient: player.wallet_address
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing refund:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});