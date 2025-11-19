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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/95 backdrop-blur-md">
      <Card className="p-12 max-w-lg w-full space-y-8 bg-card shadow-2xl border animate-scale-in">
        <div className="text-center space-y-6">
          <Trophy className="w-20 h-20 mx-auto text-foreground" />
          
          {isWinner ? (
            <>
              <h1 className="text-5xl font-bold text-foreground tracking-tight">
                Victory
              </h1>
              <p className="text-xl text-muted-foreground">You Won!</p>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold text-foreground tracking-tight">
                Game Over
              </h1>
              <p className="text-xl text-muted-foreground">{winnerName} Won!</p>
            </>
          )}
          
          <div className="pt-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Final Score</p>
            <p className="text-5xl font-bold text-foreground">{Math.floor(finalScore)}</p>
          </div>
        </div>

        <Button
          onClick={onPlayAgain}
          className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Play Again
        </Button>
      </Card>
    </div>
  );
};
