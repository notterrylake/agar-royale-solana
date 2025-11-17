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
        <Card className="p-4 bg-card/90 backdrop-blur-sm border-primary/20">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Session Code</p>
            <p className="text-2xl font-bold font-mono text-primary">{sessionCode}</p>
          </div>
        </Card>
      )}
      
      <Card className="p-4 bg-card/90 backdrop-blur-sm border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Leaderboard</h3>
        </div>
        
        <div className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                player.id === currentPlayerId
                  ? 'bg-primary/20 border border-primary/40'
                  : 'bg-muted/40'
              } ${!player.is_alive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6">
                  {index === 0 ? (
                    <Crown className="w-5 h-5 text-primary" />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold truncate max-w-[150px]">
                    {player.player_name}
                    {player.id === currentPlayerId && (
                      <span className="text-xs text-primary ml-2">(You)</span>
                    )}
                  </p>
                  {!player.is_alive && (
                    <p className="text-xs text-destructive">Eliminated</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">
                  {Math.floor(player.score)}
                </p>
                <p className="text-xs text-muted-foreground">food eaten</p>
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
