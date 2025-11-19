import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PhantomWallet } from './PhantomWallet';
import { SpinningWheel } from './SpinningWheel';
import { toast } from 'sonner';
import { PublicKey } from '@solana/web3.js';

interface HomeScreenProps {
  onStartGame: (playerName: string, sessionCode?: string) => void;
}

export const HomeScreen = ({ onStartGame }: HomeScreenProps) => {
  const [playerName, setPlayerName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [walletPublicKey, setWalletPublicKey] = useState<PublicKey | null>(null);

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
        <PhantomWallet onWalletChange={setWalletPublicKey} />
      </div>

      <div className="absolute top-4 left-4">
        <SpinningWheel walletPublicKey={walletPublicKey} />
      </div>

      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-7xl font-bold text-foreground tracking-tight animate-fade-in">
            Agar.io
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Multiplayer Cell Battle Arena
          </p>
        </div>

        {mode === 'menu' && (
          <Card className="p-8 space-y-4 bg-card shadow-lg border animate-scale-in">
            <Button
              onClick={() => setMode('create')}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
            >
              Create New Game
            </Button>
            <Button
              onClick={() => setMode('join')}
              variant="outline"
              className="w-full h-12 text-base font-medium border-2 hover:bg-muted"
            >
              Join Existing Game
            </Button>
            <div className="pt-4 space-y-1.5 text-center text-xs text-muted-foreground">
              <p>• Max 50 players per game</p>
              <p>• First to eat 100 food wins</p>
              <p>• Press W to eject mass</p>
              <p>• Press SPACE to split</p>
            </div>
          </Card>
        )}

        {mode === 'create' && (
          <Card className="p-8 space-y-4 bg-card shadow-lg border animate-scale-in">
            <h2 className="text-2xl font-bold text-center text-foreground">Create Game</h2>
            <Input
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="h-11 text-base"
              maxLength={20}
            />
            <div className="space-y-2">
              <Button
                onClick={handleCreate}
                className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold"
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
          <Card className="p-8 space-y-4 bg-card shadow-lg border animate-scale-in">
            <h2 className="text-2xl font-bold text-center text-foreground">Join Game</h2>
            <Input
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="h-11 text-base"
              maxLength={20}
            />
            <Input
              placeholder="Enter session code"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              className="h-11 text-base font-mono tracking-widest"
              maxLength={6}
            />
            <div className="space-y-2">
              <Button
                onClick={handleJoin}
                className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold"
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
