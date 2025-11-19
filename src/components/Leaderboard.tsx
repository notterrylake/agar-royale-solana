import { Trophy, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Player {
  id: string;
  player_name: string;
  score: number;
  is_alive: boolean;
}

interface LeaderboardProps {
  players: Player[];
  currentPlayerId?: string;
  sessionCode?: string;
}

export const Leaderboard = ({ players, currentPlayerId, sessionCode }: LeaderboardProps) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <div className="fixed top-4 right-4 w-80 space-y-2 z-20">
      {sessionCode && (
        <Card className="p-4 bg-card/95 backdrop-blur-sm border shadow-md">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Session Code</p>
            <p className="text-xl font-bold font-mono tracking-widest text-foreground">{sessionCode}</p>
          </div>
        </Card>
      )}
      
      <Card className="p-4 bg-card/95 backdrop-blur-sm border shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Leaderboard</h3>
        </div>
        
        <div className="space-y-1.5">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2 rounded-md transition-all ${
                player.id === currentPlayerId
                  ? 'bg-primary/10 border border-primary'
                  : 'bg-muted/30'
              } ${!player.is_alive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6">
                  {index === 0 ? (
                    <Crown className="w-4 h-4 text-foreground" />
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm truncate max-w-[150px] text-foreground">
                    {player.player_name}
                    {player.id === currentPlayerId && (
                      <span className="text-xs text-primary ml-1">(You)</span>
                    )}
                  </p>
                  {!player.is_alive && (
                    <p className="text-xs text-destructive">Eliminated</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-foreground">
                  {Math.floor(player.score)}
                </p>
                <p className="text-xs text-muted-foreground">food</p>
              </div>
            </div>
          ))}
        </div>

        {sortedPlayers.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No players yet
          </p>
        )}
      </Card>
    </div>
  );
};
