const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");
const btnRestart = document.getElementById("btnRestart");
const btnResetScore = document.getElementById("btnResetScore");
const difficultyEl = document.getElementById("difficulty");

const xWinsEl = document.getElementById("xWins");
const oWinsEl = document.getElementById("oWins");
const drawsEl = document.getElementById("draws");

const HUMAN = "X";
const AI = "O";

const winLines = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

let board = [];
let finished = false;
let score = { X:0, O:0, D:0 };

// ===== 初始化棋盤 =====
function buildGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.i = i;
    cell.onclick = onHumanMove;
    grid.appendChild(cell);
  }
}

// ===== UI 更新 =====
function render() {
  document.querySelectorAll(".cell").forEach((c, i) => {
    c.textContent = board[i];
    c.classList.toggle("disabled", finished || board[i] !== "");
    c.classList.remove("win");
  });

  xWinsEl.textContent = score.X;
  oWinsEl.textContent = score.O;
  drawsEl.textContent = score.D;
}

function highlight(line) {
  document.querySelectorAll(".cell").forEach((c, i) => {
    if (line.includes(i)) c.classList.add("win");
  });
}

// ===== 勝負判斷 =====
function checkResult(bd) {
  for (const line of winLines) {
    const [i1, i2, i3] = line;
    if (bd[i1] && bd[i1] === bd[i2] && bd[i1] === bd[i3]) {
      return { type: "WIN", winner: bd[i1], line };
    }
  }
  if (bd.every(v => v !== "")) return { type: "DRAW" };
  return { type: "NONE" };
}

// ===== 玩家落子 =====
function onHumanMove(e) {
  if (finished) return;

  const i = Number(e.target.dataset.i);
  if (board[i] !== "") return;

  board[i] = HUMAN;

  let r = checkResult(board);
  if (r.type === "WIN") {
    finished = true;
    score.X++;
    statusEl.textContent = "你獲勝（X）";
    render(); highlight(r.line);
    return;
  }
  if (r.type === "DRAW") {
    finished = true;
    score.D++;
    statusEl.textContent = "平手";
    render();
    return;
  }

  statusEl.textContent = "電腦回合（O）";
  render();

  // 小延遲更像真人
  setTimeout(aiMove, 220);
}

// ===== 電腦落子（依難度）=====
function aiMove() {
  if (finished) return;

  const diff = difficultyEl ? difficultyEl.value : "normal";
  let move = -1;

  if (diff === "easy") {
    move = randomMove(board);
  } else if (diff === "normal") {
    // 普通：能贏先贏 / 必擋先擋，其他用「人類風」策略
    move = winOrBlockMove(board);
    if (move === -1) move = heuristicMove(board);
  } else { // hard
    move = findBestMove(board); // Minimax
  }

  if (move !== -1) board[move] = AI;

  const r = checkResult(board);
  if (r.type === "WIN") {
    finished = true;
    score.O++;
    statusEl.textContent = "電腦獲勝（O）";
    render(); highlight(r.line);
    return;
  }
  if (r.type === "DRAW") {
    finished = true;
    score.D++;
    statusEl.textContent = "平手";
    render();
    return;
  }

  statusEl.textContent = "你的回合（X）";
  render();
}

// ===== 難度：簡單（隨機）=====
function randomMove(bd) {
  const empties = [];
  for (let i = 0; i < 9; i++) if (bd[i] === "") empties.push(i);
  if (!empties.length) return -1;
  return empties[Math.floor(Math.random() * empties.length)];
}

// ===== 難度：普通（先贏/先擋）=====
function winOrBlockMove(bd) {
  const empties = [];
  for (let i = 0; i < 9; i++) if (bd[i] === "") empties.push(i);

  // 1) 我能贏
  for (const i of empties) {
    bd[i] = AI;
    const r = checkResult(bd);
    bd[i] = "";
    if (r.type === "WIN" && r.winner === AI) return i;
  }

  // 2) 我必須擋
  for (const i of empties) {
    bd[i] = HUMAN;
    const r = checkResult(bd);
    bd[i] = "";
    if (r.type === "WIN" && r.winner === HUMAN) return i;
  }

  return -1;
}

// 普通難度的「人類風」策略（中心→角落→邊）
function heuristicMove(bd) {
  if (bd[4] === "") return 4;

  const corners = [0,2,6,8].filter(i => bd[i] === "");
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  const edges = [1,3,5,7].filter(i => bd[i] === "");
  if (edges.length) return edges[Math.floor(Math.random() * edges.length)];

  return randomMove(bd);
}

// ===== 困難：Minimax（最佳解）=====
function availableMoves(bd) {
  const moves = [];
  for (let i = 0; i < 9; i++) if (bd[i] === "") moves.push(i);
  return moves;
}

function findBestMove(bd) {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (const i of availableMoves(bd)) {
    bd[i] = AI;
    const score = minimax(bd, 0, false);
    bd[i] = "";
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove;
}

function minimax(bd, depth, isMaximizing) {
  const r = checkResult(bd);

  if (r.type === "WIN") {
    return r.winner === AI ? (10 - depth) : (depth - 10);
  }
  if (r.type === "DRAW") return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (const i of availableMoves(bd)) {
      bd[i] = AI;
      best = Math.max(best, minimax(bd, depth + 1, false));
      bd[i] = "";
    }
    return best;
  } else {
    let best = Infinity;
    for (const i of availableMoves(bd)) {
      bd[i] = HUMAN;
      best = Math.min(best, minimax(bd, depth + 1, true));
      bd[i] = "";
    }
    return best;
  }
}

// ===== 控制 =====
function restartGame() {
  board = Array(9).fill("");
  finished = false;
  statusEl.textContent = "你的回合（X）";
  render();
}

function resetScore() {
  score = { X:0, O:0, D:0 };
  restartGame();
}

buildGrid();
restartGame();

btnRestart.onclick = restartGame;
btnResetScore.onclick = resetScore;

// 若切換難度，建議直接開新局（避免狀態混亂）
if (difficultyEl) {
  difficultyEl.onchange = () => restartGame();
}
