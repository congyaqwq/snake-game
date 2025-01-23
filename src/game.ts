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

let snake: Position[] = [];
let food: Position;
let direction: Direction;
let gameInterval: NodeJS.Timeout;
let gameSpeed: number;
let score: number;
let isGameOver: boolean;

const levels = [
  { target: 5, speed: INITIAL_SPEED },
  { target: 10, speed: INITIAL_SPEED - 30 },
  { target: 15, speed: INITIAL_SPEED - 60 }
];

function initGame() {
  snake = [{ x: 10, y: 10 }];
  direction = 'right';
  gameSpeed = levels[0].speed;
  score = 0;
  isGameOver = false;
  generateFood();
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE)
  };

  if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    generateFood();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = 'lime';
  snake.forEach(segment => {
    ctx.fillRect(
      segment.x * TILE_SIZE,
      segment.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
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

  const head = { ...snake[0] };

  switch (direction) {
    case 'up': head.y--; break;
    case 'down': head.y++; break;
    case 'left': head.x--; break;
    case 'right': head.x++; break;
  }

  // Check collision with walls
  if (
    head.x < 0 || head.x >= GRID_SIZE ||
    head.y < 0 || head.y >= GRID_SIZE
  ) {
    gameOver();
    return;
  }

  // Check collision with self
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // Check if snake eats food
  if (head.x === food.x && head.y === food.y) {
    score++;
    checkLevelCompletion();
    generateFood();
  } else {
    snake.pop();
  }

  draw();
}

function checkLevelCompletion() {
  const currentLevel = levels[Number(levelSelect.value) - 1];
  if (score >= currentLevel.target) {
    alert(`Level ${levelSelect.value} completed!`);
    levelSelect.value = String(Math.min(Number(levelSelect.value) + 1, 3));
    initGame();
  }
}

function gameOver() {
  isGameOver = true;
  clearInterval(gameInterval);
  alert('Game Over!');
}

function startGame() {
  initGame();
  gameInterval = setInterval(update, gameSpeed);
}

function handleKeyDown(e: KeyboardEvent) {
  const key = e.key.toLowerCase();
  const oppositeDirections: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
  };

  if (
    ['arrowup', 'w'].includes(key) && direction !== oppositeDirections.up
  ) {
    direction = 'up';
  } else if (
    ['arrowdown', 's'].includes(key) && direction !== oppositeDirections.down
  ) {
    direction = 'down';
  } else if (
    ['arrowleft', 'a'].includes(key) && direction !== oppositeDirections.left
  ) {
    direction = 'left';
  } else if (
    ['arrowright', 'd'].includes(key) && direction !== oppositeDirections.right
  ) {
    direction = 'right';
  }
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', initGame);
window.addEventListener('keydown', handleKeyDown);
