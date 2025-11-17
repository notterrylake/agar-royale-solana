import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PhantomWallet } from './PhantomWallet';
import { toast } from 'sonner';

interface HomeScreenProps {
  onStartGame: (playerName: string, sessionCode?: string) => void;
}

export const HomeScreen = ({ onStartGame }: HomeScreenProps) => {
  const [playerName, setPlayerName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

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
      <div className="absolute top-4 right-4">
        <PhantomWallet />
      </div>

      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
            Agar.io
          </h1>
          <p className="text-xl text-muted-foreground">
            Multiplayer Cell Battle Arena
          </p>
        </div>

        {mode === 'menu' && (
          <Card className="p-8 space-y-4 bg-card/80 backdrop-blur-sm border-primary/20 animate-scale-in">
            <Button
              onClick={() => setMode('create')}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Create New Game
            </Button>
            <Button
              onClick={() => setMode('join')}
              variant="outline"
              className="w-full h-14 text-lg font-bold border-primary/40 hover:bg-primary/10"
            >
              Join Existing Game
            </Button>
            <div className="pt-4 space-y-2 text-center text-sm text-muted-foreground">
              <p>• Max 50 players per game</p>
              <p>• First to eat 100 food wins</p>
              <p>• Press W to eject mass</p>
              <p>• Press SPACE to split</p>
            </div>
          </Card>
        )}

        {mode === 'create' && (
          <Card className="p-8 space-y-4 bg-card/80 backdrop-blur-sm border-primary/20 animate-scale-in">
            <h2 className="text-2xl font-bold text-center">Create Game</h2>
            <Input
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="h-12 text-lg"
              maxLength={20}
            />
            <div className="space-y-2">
              <Button
                onClick={handleCreate}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                Start Game
              </Button>
              <Button
                onClick={() => setMode('menu')}
                variant="ghost"
                className="w-full"
              >
                Back
              </Button>
            </div>
          </Card>
        )}

        {mode === 'join' && (
          <Card className="p-8 space-y-4 bg-card/80 backdrop-blur-sm border-primary/20 animate-scale-in">
            <h2 className="text-2xl font-bold text-center">Join Game</h2>
            <Input
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="h-12 text-lg"
              maxLength={20}
            />
            <Input
              placeholder="Enter session code"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              className="h-12 text-lg font-mono"
              maxLength={6}
            />
            <div className="space-y-2">
              <Button
                onClick={handleJoin}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                Join Game
              </Button>
              <Button
                onClick={() => setMode('menu')}
                variant="ghost"
                className="w-full"
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
