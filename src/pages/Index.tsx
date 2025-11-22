import { useState } from 'react';
import { GameCanvas } from '@/components/GameCanvas';
import { HomeScreen } from '@/components/HomeScreen';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const [gameState, setGameState] = useState<'home' | 'playing'>('home');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [sessionCode, setSessionCode] = useState<string | null>(null);

  const generateSessionCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const [selectedSkin, setSelectedSkin] = useState<number>(1);

  const handleStartGame = async (playerName: string, joinCode?: string, skinId?: number) => {
    if (skinId) setSelectedSkin(skinId);
    
    try {
      // Check if player has cooldown by checking localStorage for recent player ID
      const recentPlayerId = localStorage.getItem('recent_player_id');
      if (recentPlayerId) {
        const { data: recentPlayer } = await supabase
          .from('players')
          .select('last_game_ended_at')
          .eq('id', recentPlayerId)
          .single();

        if (recentPlayer?.last_game_ended_at) {
          const endTime = new Date(recentPlayer.last_game_ended_at).getTime();
          const now = new Date().getTime();
          const timeSinceEnd = (now - endTime) / 1000; // in seconds

          if (timeSinceEnd < 5) {
            const remaining = Math.ceil(5 - timeSinceEnd);
            toast.error(`Please wait ${remaining} more second${remaining !== 1 ? 's' : ''} before starting a new game`);
            return;
          }
        }
      }

      if (joinCode) {
        // Join existing game
        const { data: session, error: sessionError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('session_code', joinCode)
          .eq('status', 'waiting')
          .single();

        if (sessionError || !session) {
          toast.error('Game session not found or already started');
          return;
        }

        // Check player count
        const { count } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id);

        if (count && count >= session.max_players) {
          toast.error('Game is full');
          return;
        }

        // Create player
        const { data: player, error: playerError } = await supabase
          .from('players')
          .insert({
            session_id: session.id,
            player_name: playerName,
            score: 0,
            is_alive: true
          })
          .select()
          .single();

        if (playerError || !player) {
          toast.error('Failed to join game');
          return;
        }

        localStorage.setItem('recent_player_id', player.id);
        setSessionId(session.id);
        setPlayerId(player.id);
        setSessionCode(session.session_code);
        setGameState('playing');
        toast.success(`Joined game ${joinCode}`);
      } else {
        // Create new game
        const code = generateSessionCode();
        
        const { data: session, error: sessionError } = await supabase
          .from('game_sessions')
          .insert({
            session_code: code,
            max_players: 50,
            win_condition_food: 100,
            status: 'waiting'
          })
          .select()
          .single();

        if (sessionError || !session) {
          toast.error('Failed to create game');
          return;
        }

        // Create player
        const { data: player, error: playerError } = await supabase
          .from('players')
          .insert({
            session_id: session.id,
            player_name: playerName,
            score: 0,
            is_alive: true
          })
          .select()
          .single();

        if (playerError || !player) {
          toast.error('Failed to create player');
          return;
        }

        localStorage.setItem('recent_player_id', player.id);
        setSessionId(session.id);
        setPlayerId(player.id);
        setSessionCode(session.session_code);
        setGameState('playing');
        toast.success(`Game created! Share code: ${code}`);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to start game');
    }
  };

  const handlePlayAgain = () => {
    setGameState('home');
    setSessionId(null);
    setPlayerId(null);
    setSessionCode(null);
  };

  return (
    <div className="relative">
      {gameState === 'home' ? (
        <HomeScreen onStartGame={handleStartGame} />
      ) : (
        <GameCanvas
          sessionId={sessionId!}
          playerId={playerId!}
          sessionCode={sessionCode!}
          onPlayAgain={handlePlayAgain}
          selectedSkin={selectedSkin}
        />
      )}
    </div>
  );
};

export default Index;
