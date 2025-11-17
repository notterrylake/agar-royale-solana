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
  id: string;
}

interface Food {
  x: number;
  y: number;
  color: string;
}

interface Cactus {
  x: number;
  y: number;
  radius: number;
}

const COLORS = [
  '#00ffff', '#ff00ff', '#ff00aa', '#00ff88', '#ffaa00', '#0088ff',
  '#ff0066', '#00ff00', '#ff6600', '#0066ff'
];

const WORLD_SIZE = 3000;
const FOOD_COUNT = 500;
const BOT_COUNT = 15;
const CACTUS_COUNT = 30;
const MAX_PLAYER_CELLS = 16;

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const playerCells = useRef<Cell[]>([]);
  const botCells = useRef<Cell[]>([]);
  const foods = useRef<Food[]>([]);
  const cacti = useRef<Cactus[]>([]);
  const cameraPos = useRef({ x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 });
  const cellIdCounter = useRef(0);

  const initGame = () => {
    cellIdCounter.current = 0;
    // Initialize player
    playerCells.current = [{
      x: WORLD_SIZE / 2,
      y: WORLD_SIZE / 2,
      radius: 20,
      color: COLORS[0],
      vx: 0,
      vy: 0,
      isPlayer: true,
      name: 'You',
      id: `player-${cellIdCounter.current++}`
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
      name: `Bot ${i + 1}`,
      id: `bot-${cellIdCounter.current++}`
    }));

    // Initialize food
    foods.current = Array.from({ length: FOOD_COUNT }, () => ({
      x: Math.random() * WORLD_SIZE,
      y: Math.random() * WORLD_SIZE,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));

    // Initialize cacti
    cacti.current = Array.from({ length: CACTUS_COUNT }, () => ({
      x: Math.random() * WORLD_SIZE,
      y: Math.random() * WORLD_SIZE,
      radius: 20 + Math.random() * 30
    }));

    setScore(0);
    setGameStarted(true);
    toast.success('Game started! Move to control. W to eject mass. SPACE to split.');
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
        splitCells();
      }
      if (e.code === 'KeyW' && playerCells.current.length > 0) {
        e.preventDefault();
        ejectMass();
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyPress);

    const ejectMass = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      playerCells.current.forEach(cell => {
        if (cell.radius > 15) {
          const angle = Math.atan2(
            mousePos.current.y - canvas.height / 2,
            mousePos.current.x - canvas.width / 2
          );
          
          // Reduce player cell size
          const massLoss = 2;
          cell.radius = Math.sqrt(Math.max(0, cell.radius ** 2 - massLoss ** 2));
          
          // Create ejected mass as food
          const ejectSpeed = 20;
          const ejectDistance = cell.radius + 10;
          foods.current.push({
            x: cell.x + Math.cos(angle) * ejectDistance,
            y: cell.y + Math.sin(angle) * ejectDistance,
            color: cell.color
          });
        }
      });
    };

    const splitCells = () => {
      if (playerCells.current.length >= MAX_PLAYER_CELLS) {
        toast.error('Maximum split reached!');
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const newCells: Cell[] = [];
      playerCells.current.forEach(cell => {
        if (cell.radius > 20 && newCells.length + playerCells.current.length < MAX_PLAYER_CELLS) {
          const angle = Math.atan2(
            mousePos.current.y - canvas.height / 2,
            mousePos.current.x - canvas.width / 2
          );
          const newRadius = cell.radius / Math.sqrt(2);
          const splitDistance = newRadius * 2;
          
          newCells.push({
            ...cell,
            radius: newRadius,
            id: `player-${cellIdCounter.current++}`
          });
          newCells.push({
            ...cell,
            radius: newRadius,
            x: cell.x + Math.cos(angle) * splitDistance,
            y: cell.y + Math.sin(angle) * splitDistance,
            vx: Math.cos(angle) * 20,
            vy: Math.sin(angle) * 20,
            id: `player-${cellIdCounter.current++}`
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
      
      // Check cactus collisions
      playerCells.current = playerCells.current.filter(cell => {
        for (const cactus of cacti.current) {
          const dist = Math.hypot(cell.x - cactus.x, cell.y - cactus.y);
          if (dist < cell.radius + cactus.radius) {
            toast.error('Hit a cactus!');
            return false;
          }
        }
        return true;
      });

      if (playerCells.current.length === 0 && gameStarted) {
        toast.error('Game Over! Your score: ' + Math.floor(score));
        setGameStarted(false);
        return;
      }
      
      // Check cell eating
      for (let i = 0; i < allCells.length; i++) {
        for (let j = i + 1; j < allCells.length; j++) {
          const cell1 = allCells[i];
          const cell2 = allCells[j];
          const dist = Math.hypot(cell1.x - cell2.x, cell1.y - cell2.y);
          
          if (dist < Math.max(cell1.radius, cell2.radius)) {
            if (cell1.radius > cell2.radius * 1.15) {
              cell1.radius = Math.sqrt(cell1.radius ** 2 + cell2.radius ** 2);
              if (cell2.isPlayer) {
                playerCells.current = playerCells.current.filter(c => c.id !== cell2.id);
                if (playerCells.current.length === 0) {
                  toast.error('Game Over! Your score: ' + Math.floor(score));
                  setGameStarted(false);
                }
              } else {
                botCells.current = botCells.current.filter(c => c.id !== cell2.id);
              }
            } else if (cell2.radius > cell1.radius * 1.15) {
              cell2.radius = Math.sqrt(cell1.radius ** 2 + cell2.radius ** 2);
              if (cell1.isPlayer) {
                playerCells.current = playerCells.current.filter(c => c.id !== cell1.id);
                if (playerCells.current.length === 0) {
                  toast.error('Game Over! Your score: ' + Math.floor(score));
                  setGameStarted(false);
                }
              } else {
                botCells.current = botCells.current.filter(c => c.id !== cell1.id);
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

      // Update player cells with slower, smoother movement
      playerCells.current.forEach(cell => {
        const dx = mousePos.current.x - canvas.width / 2;
        const dy = mousePos.current.y - canvas.height / 2;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 10) {
          // Much slower speed calculation
          const baseSpeed = 2.5;
          const speed = Math.max(0.8, baseSpeed - cell.radius / 30);
          const targetVx = (dx / dist) * speed;
          const targetVy = (dy / dist) * speed;
          
          // Smooth interpolation for velocity
          cell.vx += (targetVx - cell.vx) * 0.15;
          cell.vy += (targetVy - cell.vy) * 0.15;
        } else {
          // Gradually slow down when near target
          cell.vx *= 0.9;
          cell.vy *= 0.9;
        }

        cell.x += cell.vx;
        cell.y += cell.vy;

        // Boundary check
        cell.x = Math.max(cell.radius, Math.min(WORLD_SIZE - cell.radius, cell.x));
        cell.y = Math.max(cell.radius, Math.min(WORLD_SIZE - cell.radius, cell.y));

        // Increased friction for smoother feel
        cell.vx *= 0.98;
        cell.vy *= 0.98;
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
        if (sx > -50 && sx < canvas.width + 50 && sy > -50 && sy < canvas.height + 50) {
          ctx.fillStyle = food.color;
          ctx.beginPath();
          ctx.arc(sx, sy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw cacti
      cacti.current.forEach(cactus => {
        const sx = toScreenX(cactus.x);
        const sy = toScreenY(cactus.y);
        if (sx > -100 && sx < canvas.width + 100 && sy > -100 && sy < canvas.height + 100) {
          // Cactus body
          ctx.fillStyle = '#2d5016';
          ctx.beginPath();
          ctx.arc(sx, sy, cactus.radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Cactus spikes
          ctx.strokeStyle = '#1a3009';
          ctx.lineWidth = 2;
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(
              sx + Math.cos(angle) * cactus.radius,
              sy + Math.sin(angle) * cactus.radius
            );
            ctx.stroke();
          }
          
          // Danger glow
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(sx, sy, cactus.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
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
              Eat to grow. Avoid bigger cells and cacti.<br/>
              Press W to eject mass. Press SPACE to split.
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
