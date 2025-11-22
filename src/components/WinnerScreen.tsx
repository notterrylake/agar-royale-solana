import { Trophy, RefreshCw, Clock } from 'lucide-react';
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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/98 backdrop-blur-2xl">
      <Card className="p-14 max-w-xl w-full space-y-10 bg-card/90 backdrop-blur-xl shadow-[0_0_100px_rgba(255,255,255,0.1)] border-white/10 animate-scale-in">
        <div className="text-center space-y-8">
          <Trophy className="w-24 h-24 mx-auto text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
          
          {isWinner ? (
            <>
              <h1 className="text-7xl font-extrabold text-white tracking-tighter uppercase" style={{ letterSpacing: '-0.05em' }}>
                Victory
              </h1>
              <p className="text-2xl text-white/70 font-light">You Won!</p>
            </>
          ) : (
            <>
              <h1 className="text-7xl font-extrabold text-white tracking-tighter uppercase" style={{ letterSpacing: '-0.05em' }}>
                Game Over
              </h1>
              <p className="text-2xl text-white/70 font-light">{winnerName} Won!</p>
            </>
          )}
          
          <div className="pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mb-2">Final Score</p>
            <p className="text-6xl font-extrabold text-white">{Math.floor(finalScore)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground/70 text-sm">
            <Clock className="w-4 h-4" />
            <p className="font-medium">Please wait 5 seconds before starting a new game</p>
          </div>
          
          <Button
            onClick={onPlayAgain}
            className="w-full h-14 text-base font-bold bg-white text-black hover:bg-white/90 gap-3 uppercase tracking-wide shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Play Again
          </Button>
        </div>
      </Card>
    </div>
  );
};
