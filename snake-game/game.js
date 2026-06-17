const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const CELL = 20;
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;
const TICK_MS = 150;

const DIR = { UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0] };

let snake, direction, nextDirection, food, score, running, loopId;

function init() {
  const midX = Math.floor(COLS / 2);
  const midY = Math.floor(ROWS / 2);
  snake = [
    { x: midX, y: midY },
    { x: midX - 1, y: midY },
    { x: midX - 2, y: midY },
  ];
  direction = DIR.RIGHT;
  nextDirection = DIR.RIGHT;
  food = null;
  score = 0;
  running = true;
  spawnFood();
}

function spawnFood() {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  const empty = [];
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
    }
  }
  if (empty.length === 0) return;
  food = empty[Math.floor(Math.random() * empty.length)];
}

function update() {
  direction = nextDirection;
  const head = snake[0];
  const nx = head.x + direction[0];
  const ny = head.y + direction[1];

  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return gameOver();
  if (snake.some((s) => s.x === nx && s.y === ny)) return gameOver();

  snake.unshift({ x: nx, y: ny });

  if (food && nx === food.x && ny === food.y) {
    score++;
    spawnFood();
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0f0";
  for (const s of snake) {
    ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
  }

  if (food) {
    ctx.fillStyle = "#f00";
    ctx.fillRect(food.x * CELL + 1, food.y * CELL + 1, CELL - 2, CELL - 2);
  }

  ctx.fillStyle = "#fff";
  ctx.font = "14px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 8, 18);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 28px monospace";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

  ctx.font = "16px monospace";
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
  ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 40);
}

function gameOver() {
  running = false;
  clearInterval(loopId);
  drawGameOver();
}

function tick() {
  update();
  if (running) draw();
}

function restart() {
  clearInterval(loopId);
  init();
  draw();
  loopId = setInterval(tick, TICK_MS);
}

function opposites(a, b) {
  return a[0] + b[0] === 0 && a[1] + b[1] === 0;
}

document.addEventListener("keydown", (e) => {
  const key = e.key;
  let dir = null;

  if (key === "ArrowUp" || key === "w" || key === "W") dir = DIR.UP;
  else if (key === "ArrowDown" || key === "s" || key === "S") dir = DIR.DOWN;
  else if (key === "ArrowLeft" || key === "a" || key === "A") dir = DIR.LEFT;
  else if (key === "ArrowRight" || key === "d" || key === "D") dir = DIR.RIGHT;
  else if (key === "r" || key === "R") {
    restart();
    return;
  }

  if (dir && !opposites(dir, direction)) {
    nextDirection = dir;
    e.preventDefault();
  }
});

const restartBtn = document.getElementById("restart-btn");
if (restartBtn) restartBtn.addEventListener("click", restart);

restart();
