// ===== DOM =====
const gridEl = document.getElementById("grid");
const statusEl = document.getElementById("status");
const btnRestart = document.getElementById("btnRestart");
const btnResetScore = document.getElementById("btnResetScore");

const xWinsEl = document.getElementById("xWins");
const oWinsEl = document.getElementById("oWins");
const drawsEl = document.getElementById("draws");

// ===== Game Config =====
const HUMAN = "X";
const AI = "O";

const winLines = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// ===== State =====
let board = Array(9).fill("");
let finished = false;
let locked = false; // 防止人類在電腦思考/落子時狂點
let score = { X: 0, O: 0, D: 0 };

// ===== UI =====
function buildGrid() {
  gridEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.idx = String(i);
    cell.addEventListener("click", onCellClick);
    gridEl.appendChild(cell);
  }
}

function render() {
  const cells = gridEl.querySelectorAll(".cell");
  cells.forEach((c, i) => {
    c.textContent = board[i];
    c.classList.toggle("disabled", finished || locked || board[i] !== "");
    c.classList.remove("win");
  });

  xWinsEl.textContent = String(score.X);
  oWinsEl.textContent = String(score.O);
  drawsEl.textContent = String(score.D);
}

// ===== Result Check =====
function getResult(b) {
  for (const line of winLines) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { type: "WIN", winner: b[a], line };
    }
  }
  if (b.every(v => v !== "")) return { type: "DRAW" };
  return { type: "NONE" };
}

function highlightWin(line) {
  const cells = gridEl.querySelectorAll(".cell");
  line.forEach(i => cells[i].classList.add("win"));
}

// ===== Human Move =====
function onCellClick(e) {
  if (finished || locked) return;

  const idx = Number(e.currentTarget.dataset.idx);
  if (Number.isNaN(idx) || board[idx] !== "") return;

  // Human places X
  board[idx] = HUMAN;

  // Check after human move
  const r1 = getResult(board);
  if (r1.type === "WIN") {
    finished = true;
    score[HUMAN] += 1;
    statusEl.innerHTML = `結果：你獲勝 <b>（X）</b>`;
    render();
    highlightWin(r1.line);
    return;
  }
  if (r1.type === "DRAW") {
    finished = true;
    score.D += 1;
    statusEl.innerHTML = `結果：<b>平手</b>`;
    render();
    return;
  }

  // AI turn
  statusEl.innerHTML = `電腦回合：<b>O</b>`;
  locked = true;
  render();

  // 做一點點延遲，體感更自然
  setTimeout(() => {
    aiMove();
  }, 220);
}

// ===== AI =====
function aiMove() {
  if (finished) return;

  const best = findBestMove(board);
  if (best !== -1) board[best] = AI;

  const r2 = getResult(board);
  if (r2.type === "WIN") {
    finished = true;
    score[AI] += 1;
    statusEl.innerHTML = `結果：電腦獲勝 <b>（O）</b>`;
    locked = false;
    render();
    highlightWin(r2.line);
    return;
  }
  if (r2.type === "DRAW") {
    finished = true;
    score.D += 1;
    statusEl.innerHTML = `結果：<b>平手</b>`;
    locked = false;
    render();
    return;
  }

  // Back to human
  locked = false;
  statusEl.innerHTML = `你的回合：<b>X</b>`;
  render();
}

// Minimax: AI = maximize, HUMAN = minimize
function findBestMove(b) {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (b[i] !== "") continue;

    b[i] = AI;
    const score = minimax(b, 0, false);
    b[i] = "";

    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove;
}

function minimax(b, depth, isMaximizing) {
  const r = getResult(b);
  if (r.type === "WIN") {
    // 越早贏越高分，越早輸越低分
    if (r.winner === AI) return 10 - depth;
    if (r.winner === HUMAN) return depth - 10;
  }
  if (r.type === "DRAW") return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] !== "") continue;
      b[i] = AI;
      best = Math.max(best, minimax(b, depth + 1, false));
      b[i] = "";
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] !== "") continue;
      b[i] = HUMAN;
      best = Math.min(best, minimax(b, depth + 1, true));
      b[i] = "";
    }
    return best;
  }
}

// ===== Controls =====
function restartGame() {
  board = Array(9).fill("");
  finished = false;
  locked = false;
  statusEl.innerHTML = `你的回合：<b>X</b>`;
  render();
}

function resetScore() {
  score = { X: 0, O: 0, D: 0 };
  restartGame();
}

// ===== Init =====
buildGrid();
restartGame();

btnRestart.addEventListener("click", restartGame);
btnResetScore.addEventListener("click", resetScore);
