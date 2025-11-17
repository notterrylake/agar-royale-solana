import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Cell {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  isPlayer: boolean;
  name?: string;
}

interface Food {
  x: number;
  y: number;
  color: string;
}

const COLORS = [
  '#00ffff', '#ff00ff', '#ff00aa', '#00ff88', '#ffaa00', '#0088ff',
  '#ff0066', '#00ff00', '#ff6600', '#0066ff'
];

const WORLD_SIZE = 3000;
const FOOD_COUNT = 500;
const BOT_COUNT = 15;

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const playerCells = useRef<Cell[]>([]);
  const botCells = useRef<Cell[]>([]);
  const foods = useRef<Food[]>([]);
  const cameraPos = useRef({ x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 });

  const initGame = () => {
    // Initialize player
    playerCells.current = [{
      x: WORLD_SIZE / 2,
      y: WORLD_SIZE / 2,
      radius: 20,
      color: COLORS[0],
      vx: 0,
      vy: 0,
      isPlayer: true,
      name: 'You'
    }];

    // Initialize bots
    botCells.current = Array.from({ length: BOT_COUNT }, (_, i) => ({
      x: Math.random() * WORLD_SIZE,
      y: Math.random() * WORLD_SIZE,
      radius: 15 + Math.random() * 30,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: 0,
      vy: 0,
      isPlayer: false,
      name: `Bot ${i + 1}`
    }));

    // Initialize food
    foods.current = Array.from({ length: FOOD_COUNT }, () => ({
      x: Math.random() * WORLD_SIZE,
      y: Math.random() * WORLD_SIZE,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));

    setScore(0);
    setGameStarted(true);
    toast.success('Game started! Move your mouse to control your cell. Press SPACE to split.');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameStarted) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && playerCells.current.length > 0) {
        e.preventDefault();
        splitCell();
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyPress);

    const splitCell = () => {
      const newCells: Cell[] = [];
      playerCells.current.forEach(cell => {
        if (cell.radius > 20) {
          const angle = Math.atan2(
            mousePos.current.y - canvas.height / 2,
            mousePos.current.x - canvas.width / 2
          );
          const newRadius = cell.radius / Math.sqrt(2);
          newCells.push({
            ...cell,
            radius: newRadius,
          });
          newCells.push({
            ...cell,
            radius: newRadius,
            x: cell.x + Math.cos(angle) * 50,
            y: cell.y + Math.sin(angle) * 50,
            vx: Math.cos(angle) * 15,
            vy: Math.sin(angle) * 15,
          });
        } else {
          newCells.push(cell);
        }
      });
      playerCells.current = newCells;
    };

    const updateBots = () => {
      botCells.current.forEach(bot => {
        // Simple AI: move towards nearest food or away from bigger cells
        let targetX = bot.x;
        let targetY = bot.y;
        
        const nearbyFood = foods.current.find(food => {
          const dist = Math.hypot(food.x - bot.x, food.y - bot.y);
          return dist < 200;
        });

        if (nearbyFood) {
          targetX = nearbyFood.x;
          targetY = nearbyFood.y;
        } else {
          targetX = bot.x + (Math.random() - 0.5) * 100;
          targetY = bot.y + (Math.random() - 0.5) * 100;
        }

        const angle = Math.atan2(targetY - bot.y, targetX - bot.x);
        const speed = Math.max(2, 8 - bot.radius / 10);
        bot.vx = Math.cos(angle) * speed * 0.1;
        bot.vy = Math.sin(angle) * speed * 0.1;

        bot.x += bot.vx;
        bot.y += bot.vy;

        // Boundary check
        bot.x = Math.max(bot.radius, Math.min(WORLD_SIZE - bot.radius, bot.x));
        bot.y = Math.max(bot.radius, Math.min(WORLD_SIZE - bot.radius, bot.y));

        // Friction
        bot.vx *= 0.95;
        bot.vy *= 0.95;
      });
    };

    const checkCollisions = () => {
      const allCells = [...playerCells.current, ...botCells.current];
      
      // Check cell eating
      for (let i = 0; i < allCells.length; i++) {
        for (let j = i + 1; j < allCells.length; j++) {
          const cell1 = allCells[i];
          const cell2 = allCells[j];
          const dist = Math.hypot(cell1.x - cell2.x, cell1.y - cell2.y);
          
          if (dist < Math.max(cell1.radius, cell2.radius)) {
            if (cell1.radius > cell2.radius * 1.1) {
              cell1.radius = Math.sqrt(cell1.radius ** 2 + cell2.radius ** 2);
              if (cell2.isPlayer) {
                playerCells.current = playerCells.current.filter(c => c !== cell2);
                if (playerCells.current.length === 0) {
                  toast.error('Game Over! Your score: ' + Math.floor(score));
                  setGameStarted(false);
                }
              } else {
                botCells.current = botCells.current.filter(c => c !== cell2);
              }
            } else if (cell2.radius > cell1.radius * 1.1) {
              cell2.radius = Math.sqrt(cell1.radius ** 2 + cell2.radius ** 2);
              if (cell1.isPlayer) {
                playerCells.current = playerCells.current.filter(c => c !== cell1);
                if (playerCells.current.length === 0) {
                  toast.error('Game Over! Your score: ' + Math.floor(score));
                  setGameStarted(false);
                }
              } else {
                botCells.current = botCells.current.filter(c => c !== cell1);
              }
            }
          }
        }
      }

      // Check food eating
      playerCells.current.forEach(cell => {
        foods.current = foods.current.filter(food => {
          const dist = Math.hypot(cell.x - food.x, cell.y - food.y);
          if (dist < cell.radius) {
            cell.radius = Math.sqrt(cell.radius ** 2 + 9);
            return false;
          }
          return true;
        });
      });

      // Replenish food
      while (foods.current.length < FOOD_COUNT) {
        foods.current.push({
          x: Math.random() * WORLD_SIZE,
          y: Math.random() * WORLD_SIZE,
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
      }

      // Update score
      const totalMass = playerCells.current.reduce((sum, cell) => sum + Math.PI * cell.radius ** 2, 0);
      setScore(totalMass / 10);
    };

    const gameLoop = () => {
      if (!gameStarted) return;

      // Update player cells
      playerCells.current.forEach(cell => {
        const dx = mousePos.current.x - canvas.width / 2;
        const dy = mousePos.current.y - canvas.height / 2;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 10) {
          const speed = Math.max(2, 8 - cell.radius / 10);
          cell.vx = (dx / dist) * speed * 0.1;
          cell.vy = (dy / dist) * speed * 0.1;
        }

        cell.x += cell.vx;
        cell.y += cell.vy;

        // Boundary check
        cell.x = Math.max(cell.radius, Math.min(WORLD_SIZE - cell.radius, cell.x));
        cell.y = Math.max(cell.radius, Math.min(WORLD_SIZE - cell.radius, cell.y));

        // Friction
        cell.vx *= 0.95;
        cell.vy *= 0.95;
      });

      updateBots();
      checkCollisions();

      // Update camera
      if (playerCells.current.length > 0) {
        const avgX = playerCells.current.reduce((sum, c) => sum + c.x, 0) / playerCells.current.length;
        const avgY = playerCells.current.reduce((sum, c) => sum + c.y, 0) / playerCells.current.length;
        cameraPos.current.x += (avgX - cameraPos.current.x) * 0.1;
        cameraPos.current.y += (avgY - cameraPos.current.y) * 0.1;
      }

      // Render
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      const offsetX = cameraPos.current.x % gridSize;
      const offsetY = cameraPos.current.y % gridSize;
      for (let x = -offsetX; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = -offsetY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const toScreenX = (x: number) => x - cameraPos.current.x + canvas.width / 2;
      const toScreenY = (y: number) => y - cameraPos.current.y + canvas.height / 2;

      // Draw food
      foods.current.forEach(food => {
        const sx = toScreenX(food.x);
        const sy = toScreenY(food.y);
        ctx.fillStyle = food.color;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw cells
      [...botCells.current, ...playerCells.current].forEach(cell => {
        const sx = toScreenX(cell.x);
        const sy = toScreenY(cell.y);
        
        // Glow effect
        const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, cell.radius);
        gradient.addColorStop(0, cell.color);
        gradient.addColorStop(1, cell.color + '33');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(sx, sy, cell.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = cell.isPlayer ? '#00ffff' : '#ffffff44';
        ctx.lineWidth = cell.isPlayer ? 3 : 2;
        ctx.stroke();

        // Name
        if (cell.name) {
          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.max(12, cell.radius / 3)}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell.name, sx, sy);
        }
      });

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameStarted, score]);

  return (
    <div className="relative w-full h-screen bg-background">
      {!gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Agar.io Clone
            </h1>
            <p className="text-xl text-muted-foreground">
              Eat to grow. Avoid bigger cells. Press SPACE to split.
            </p>
            <button
              onClick={initGame}
              className="px-8 py-4 text-xl font-bold rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              Start Game
            </button>
          </div>
        </div>
      )}
      
      {gameStarted && (
        <div className="absolute top-4 left-4 z-10 space-y-2">
          <div className="px-6 py-3 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/20">
            <p className="text-2xl font-bold text-primary">Score: {Math.floor(score)}</p>
          </div>
          <div className="px-6 py-3 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/20">
            <p className="text-sm text-muted-foreground">Cells: {playerCells.current.length}</p>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
