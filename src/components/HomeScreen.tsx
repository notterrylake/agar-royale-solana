import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface HomeScreenProps {
  onStartGame: (playerName: string, sessionCode?: string) => void;
}

export const HomeScreen = ({ onStartGame }: HomeScreenProps) => {
  const [playerName, setPlayerName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    onStartGame(playerName);
  };

  const handleJoin = () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!sessionCode.trim()) {
      toast.error('Please enter a session code');
      return;
    }
    onStartGame(playerName, sessionCode);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="absolute top-6 left-6">
        <Button
          onClick={() => navigate('/spin-wheel')}
          variant="ghost"
          size="sm"
          className="gap-2 text-foreground/60 hover:text-foreground hover:bg-white/5 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          Lucky Wheel
        </Button>
      </div>

      <div className="w-full max-w-lg space-y-12 px-6">
        <div className="text-center space-y-3">
          <h1 className="text-8xl font-extrabold text-foreground tracking-tighter animate-fade-in" style={{ letterSpacing: '-0.05em' }}>
            AGAR.IO
          </h1>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.2em]">
            Multiplayer Cell Battle Arena
          </p>
        </div>

        {mode === 'menu' && (
          <Card className="p-10 space-y-5 bg-card/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/10 animate-scale-in">
            <Button
              onClick={() => setMode('create')}
              className="w-full h-14 text-base font-bold bg-white text-black hover:bg-white/90 transition-all shadow-lg uppercase tracking-wide"
            >
              Create New Game
            </Button>
            <Button
              onClick={() => setMode('join')}
              variant="outline"
              className="w-full h-14 text-base font-bold border-white/20 hover:bg-white/10 hover:border-white/40 transition-all uppercase tracking-wide"
            >
              Join Existing Game
            </Button>
            <div className="pt-6 space-y-2 text-center text-xs text-muted-foreground/80">
              <p className="font-medium">• Max 50 players per game</p>
              <p className="font-medium">• First to eat 100 food wins</p>
              <p className="font-medium">• Press W to eject mass</p>
              <p className="font-medium">• Press SPACE to split</p>
            </div>
          </Card>
        )}

        {mode === 'create' && (
          <Card className="p-10 space-y-6 bg-card/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/10 animate-scale-in">
            <h2 className="text-3xl font-extrabold text-center text-foreground uppercase tracking-tight">Create Game</h2>
            <Input
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="h-12 text-base bg-white/5 border-white/10 focus:border-white/30 placeholder:text-muted-foreground/50"
              maxLength={20}
            />
            <div className="space-y-3">
              <Button
                onClick={handleCreate}
                className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wide shadow-lg"
              >
                Start Game
              </Button>
              <Button
                onClick={() => setMode('menu')}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                Back
              </Button>
            </div>
          </Card>
        )}

        {mode === 'join' && (
          <Card className="p-10 space-y-6 bg-card/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/10 animate-scale-in">
            <h2 className="text-3xl font-extrabold text-center text-foreground uppercase tracking-tight">Join Game</h2>
            <Input
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="h-12 text-base bg-white/5 border-white/10 focus:border-white/30 placeholder:text-muted-foreground/50"
              maxLength={20}
            />
            <Input
              placeholder="Enter session code"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              className="h-12 text-base font-mono tracking-[0.3em] text-center bg-white/5 border-white/10 focus:border-white/30 placeholder:text-muted-foreground/50"
              maxLength={6}
            />
            <div className="space-y-3">
              <Button
                onClick={handleJoin}
                className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wide shadow-lg"
              >
                Join Game
              </Button>
              <Button
                onClick={() => setMode('menu')}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                Back
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
