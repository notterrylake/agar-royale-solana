import { Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WinnerScreenProps {
  winnerName: string;
  isWinner: boolean;
  finalScore: number;
  onPlayAgain: () => void;
}

export const WinnerScreen = ({ winnerName, isWinner, finalScore, onPlayAgain }: WinnerScreenProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/90 backdrop-blur-sm">
      <Card className="p-12 max-w-lg w-full space-y-6 bg-card border-2 border-primary/40 animate-scale-in">
        <div className="text-center space-y-4">
          <Trophy className="w-24 h-24 mx-auto text-primary animate-bounce" />
          
          {isWinner ? (
            <>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Victory!
              </h1>
              <p className="text-2xl">You Won!</p>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Game Over
              </h1>
              <p className="text-2xl">{winnerName} Won!</p>
            </>
          )}
          
          <div className="pt-4">
            <p className="text-muted-foreground">Your Final Score</p>
            <p className="text-4xl font-bold text-primary">{Math.floor(finalScore)}</p>
          </div>
        </div>

        <Button
          onClick={onPlayAgain}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Play Again
        </Button>
      </Card>
    </div>
  );
};
