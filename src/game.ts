const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const restartBtn = document.getElementById('restart-btn') as HTMLButtonElement;
const levelSelect = document.getElementById('level-select') as HTMLSelectElement;

const GRID_SIZE = 20;
const TILE_SIZE = 20;
const INITIAL_SPEED = 150;

canvas.width = GRID_SIZE * TILE_SIZE;
canvas.height = GRID_SIZE * TILE_SIZE;

type Direction = 'up' | 'down' | 'left' | 'right';
type Position = { x: number; y: number };
type GameMode = 'single' | 'multiplayer' | 'ai';

let gameMode: GameMode = 'single';
const modeSelect = document.getElementById('mode-select') as HTMLSelectElement;
let playerSnake: Position[] = [];
let player2Snake: Position[] = [];
let player2Direction: Direction;
let aiSnakes: Position[][] = [];
let aiDirections: Direction[] = [];
let food: Position;
let playerDirection: Direction;
let gameInterval: NodeJS.Timeout;
let gameSpeed: number;
let score1: number;
let score2: number;
let isGameOver: boolean;
let gameTimer: number;
const MAX_GAME_TIME = 300; // 5 minutes in seconds

const levels = [
  { target: 5, speed: INITIAL_SPEED },
  { target: 10, speed: INITIAL_SPEED - 30 },
  { target: 15, speed: INITIAL_SPEED - 60 }
];

function initGame() {
  gameMode = modeSelect.value as GameMode;
  
  playerSnake = [{ x: 5, y: 10 }];
  playerDirection = 'right';
  
  if (gameMode === 'multiplayer') {
    player2Snake = [{ x: 15, y: 10 }];
    player2Direction = 'left';
  } else {
    player2Snake = [];
  }
  
  // Initialize AI snakes
  aiSnakes = [];
  aiDirections = [];
  if (gameMode === 'ai') {
    const aiCount = Math.floor(Math.random() * 3) + 1; // 1-3 AI snakes
    for (let i = 0; i < aiCount; i++) {
      aiSnakes.push([{ 
        x: Math.floor(GRID_SIZE * 0.75) + i * 2, 
        y: Math.floor(GRID_SIZE / 2) 
      }]);
      aiDirections.push('left');
    }
  }

  gameSpeed = levels[0].speed;
  score1 = 0;
  score2 = 0;
  isGameOver = false;
  gameTimer = MAX_GAME_TIME;
  generateFood();
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE)
  };

  // Check if food spawns on any snake
  if (
    playerSnake.some(segment => segment.x === food.x && segment.y === food.y) ||
    aiSnakes.some(snake => snake.some(segment => segment.x === food.x && segment.y === food.y))
  ) {
    generateFood();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player snake
  playerSnake.forEach((segment, index) => {
    if (index === 0) {
      // Draw head with direction indicator
      ctx.fillStyle = 'darkgreen';
      ctx.fillRect(
        segment.x * TILE_SIZE,
        segment.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
      
      // Draw direction triangle
      ctx.beginPath();
      const centerX = segment.x * TILE_SIZE + TILE_SIZE/2;
      const centerY = segment.y * TILE_SIZE + TILE_SIZE/2;
      const size = TILE_SIZE * 0.6;
      
      switch(playerDirection) {
        case 'up':
          ctx.moveTo(centerX, centerY - size/2);
          ctx.lineTo(centerX - size/2, centerY + size/2);
          ctx.lineTo(centerX + size/2, centerY + size/2);
          break;
        case 'down':
          ctx.moveTo(centerX, centerY + size/2);
          ctx.lineTo(centerX - size/2, centerY - size/2);
          ctx.lineTo(centerX + size/2, centerY - size/2);
          break;
        case 'left':
          ctx.moveTo(centerX - size/2, centerY);
          ctx.lineTo(centerX + size/2, centerY - size/2);
          ctx.lineTo(centerX + size/2, centerY + size/2);
          break;
        case 'right':
          ctx.moveTo(centerX + size/2, centerY);
          ctx.lineTo(centerX - size/2, centerY - size/2);
          ctx.lineTo(centerX - size/2, centerY + size/2);
          break;
      }
      ctx.closePath();
      ctx.fillStyle = 'yellow';
      ctx.fill();
    } else {
      // Draw body
      ctx.fillStyle = 'lime';
      ctx.fillRect(
        segment.x * TILE_SIZE,
        segment.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  });

  // Draw AI snakes
  aiSnakes.forEach((snake, index) => {
    snake.forEach((segment, segIndex) => {
      if (segIndex === 0) {
        // Draw AI head with direction indicator
        ctx.fillStyle = 'darkblue';
        ctx.fillRect(
          segment.x * TILE_SIZE,
          segment.y * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        );
        
        // Draw direction triangle
        ctx.beginPath();
        const centerX = segment.x * TILE_SIZE + TILE_SIZE/2;
        const centerY = segment.y * TILE_SIZE + TILE_SIZE/2;
        const size = TILE_SIZE * 0.6;
        
        switch(aiDirections[index]) {
          case 'up':
            ctx.moveTo(centerX, centerY - size/2);
            ctx.lineTo(centerX - size/2, centerY + size/2);
            ctx.lineTo(centerX + size/2, centerY + size/2);
            break;
          case 'down':
            ctx.moveTo(centerX, centerY + size/2);
            ctx.lineTo(centerX - size/2, centerY - size/2);
            ctx.lineTo(centerX + size/2, centerY - size/2);
            break;
          case 'left':
            ctx.moveTo(centerX - size/2, centerY);
            ctx.lineTo(centerX + size/2, centerY - size/2);
            ctx.lineTo(centerX + size/2, centerY + size/2);
            break;
          case 'right':
            ctx.moveTo(centerX + size/2, centerY);
            ctx.lineTo(centerX - size/2, centerY - size/2);
            ctx.lineTo(centerX - size/2, centerY + size/2);
            break;
        }
        ctx.closePath();
        ctx.fillStyle = 'cyan';
        ctx.fill();
      } else {
        // Draw AI body
        ctx.fillStyle = 'blue';
        ctx.fillRect(
          segment.x * TILE_SIZE,
          segment.y * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        );
      }
    });
  });

  // Draw food
  ctx.fillStyle = 'red';
  ctx.fillRect(
    food.x * TILE_SIZE,
    food.y * TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE
  );
}

function update() {
  if (isGameOver) return;

  // Update player snake
  const playerHead = { ...playerSnake[0] };
  switch (playerDirection) {
    case 'up': playerHead.y--; break;
    case 'down': playerHead.y++; break;
    case 'left': playerHead.x--; break;
    case 'right': playerHead.x++; break;
  }

  // Check player 1 collisions
  if (
    playerHead.x < 0 || playerHead.x >= GRID_SIZE ||
    playerHead.y < 0 || playerHead.y >= GRID_SIZE ||
    playerSnake.some(segment => segment.x === playerHead.x && segment.y === playerHead.y) ||
    (gameMode === 'multiplayer' && player2Snake.some(segment => segment.x === playerHead.x && segment.y === playerHead.y)) ||
    aiSnakes.some(snake => snake.some(segment => segment.x === playerHead.x && segment.y === playerHead.y))
  ) {
    gameOver('Player 1 Game Over!');
    return;
  }

  // Check player 2 collisions (multiplayer mode)
  if (gameMode === 'multiplayer') {
    const player2Head = { ...player2Snake[0] };
    switch (player2Direction) {
      case 'up': player2Head.y--; break;
      case 'down': player2Head.y++; break;
      case 'left': player2Head.x--; break;
      case 'right': player2Head.x++; break;
    }

    if (
      player2Head.x < 0 || player2Head.x >= GRID_SIZE ||
      player2Head.y < 0 || player2Head.y >= GRID_SIZE ||
      player2Snake.some(segment => segment.x === player2Head.x && segment.y === player2Head.y) ||
      playerSnake.some(segment => segment.x === player2Head.x && segment.y === player2Head.y) ||
      aiSnakes.some(snake => snake.some(segment => segment.x === player2Head.x && segment.y === player2Head.y))
    ) {
      gameOver('Player 2 Game Over!');
      return;
    }

    // Move player 2 snake
    player2Snake.unshift(player2Head);
    if (player2Head.x === food.x && player2Head.y === food.y) {
      score2++;
      checkLevelCompletion();
      generateFood();
    } else {
      player2Snake.pop();
    }
  }

  // Move player snake
  playerSnake.unshift(playerHead);
  if (playerHead.x === food.x && playerHead.y === food.y) {
    score1++;
    checkLevelCompletion();
    generateFood();
  } else {
    playerSnake.pop();
  }

  // Update AI snakes
  aiSnakes.forEach((snake, index) => {
    const aiHead = { ...snake[0] };
    const direction = getAIDirection(snake, index);
    aiDirections[index] = direction;
    
    switch (direction) {
      case 'up': aiHead.y--; break;
      case 'down': aiHead.y++; break;
      case 'left': aiHead.x--; break;
      case 'right': aiHead.x++; break;
    }

    // Move AI snake
    snake.unshift(aiHead);
    if (aiHead.x === food.x && aiHead.y === food.y) {
      score2++;
      checkLevelCompletion();
      generateFood();
    } else {
      snake.pop();
    }
  });

  draw();
}

function getAIDirection(snake: Position[], index: number): Direction {
  const head = snake[0];
  // Simple AI that moves towards food
  const dx = food.x - head.x;
  const dy = food.y - head.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
}

function checkLevelCompletion() {
  const currentLevel = levels[Number(levelSelect.value) - 1];
  if (score1 >= currentLevel.target || score2 >= currentLevel.target) {
    alert(`Level ${levelSelect.value} completed!`);
    levelSelect.value = String(Math.min(Number(levelSelect.value) + 1, 3));
    initGame();
  }
}

function gameOver(message: string) {
  isGameOver = true;
  clearInterval(gameInterval);
  alert(message);
}

function startGame() {
  initGame();
  gameInterval = setInterval(update, gameSpeed);
}

function handleKeyDown(e: KeyboardEvent) {
  if (gameMode !== 'multiplayer') {
    // Single player controls
    const key = e.key.toLowerCase();
    const oppositeDirections: Record<Direction, Direction> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };

    // Player controls (WASD and Arrow keys)
    if (['w', 'arrowup'].includes(key) && playerDirection !== oppositeDirections.up) {
      playerDirection = 'up';
    } else if (['s', 'arrowdown'].includes(key) && playerDirection !== oppositeDirections.down) {
      playerDirection = 'down';
    } else if (['a', 'arrowleft'].includes(key) && playerDirection !== oppositeDirections.left) {
      playerDirection = 'left';
    } else if (['d', 'arrowright'].includes(key) && playerDirection !== oppositeDirections.right) {
      playerDirection = 'right';
    }
  } else {
    // Multiplayer controls
    const key = e.key.toLowerCase();
    const oppositeDirections: Record<Direction, Direction> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };

    // Player 1 controls (WASD)
    if (['w'].includes(key) && playerDirection !== oppositeDirections.up) {
      playerDirection = 'up';
    } else if (['s'].includes(key) && playerDirection !== oppositeDirections.down) {
      playerDirection = 'down';
    } else if (['a'].includes(key) && playerDirection !== oppositeDirections.left) {
      playerDirection = 'left';
    } else if (['d'].includes(key) && playerDirection !== oppositeDirections.right) {
      playerDirection = 'right';
    }

    // Player 2 controls (Arrow keys)
    if (['arrowup'].includes(key) && player2Direction !== oppositeDirections.up) {
      player2Direction = 'up';
    } else if (['arrowdown'].includes(key) && player2Direction !== oppositeDirections.down) {
      player2Direction = 'down';
    } else if (['arrowleft'].includes(key) && player2Direction !== oppositeDirections.left) {
      player2Direction = 'left';
    } else if (['arrowright'].includes(key) && player2Direction !== oppositeDirections.right) {
      player2Direction = 'right';
    }
  }
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', initGame);
modeSelect.addEventListener('change', initGame);
window.addEventListener('keydown', handleKeyDown);
