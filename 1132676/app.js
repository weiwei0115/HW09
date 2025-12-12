const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");
const btnRestart = document.getElementById("btnRestart");
const btnResetScore = document.getElementById("btnResetScore");

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

// ===== 畫面更新 =====
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

// ===== 勝負判斷（已確認安全）=====
function checkResult(bd) {
  for (const line of winLines) {
    const [i1, i2, i3] = line;
    if (
      bd[i1] &&
      bd[i1] === bd[i2] &&
      bd[i1] === bd[i3]
    ) {
      return { type: "WIN", winner: bd[i1], line };
    }
  }
  if (bd.every(v => v !== "")) return { type: "DRAW" };
  return { type: "NONE" };
}

function highlight(line) {
  document.querySelectorAll(".cell").forEach((c, i) => {
    if (line.includes(i)) c.classList.add("win");
  });
}

// ===== 玩家 =====
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

  // 電腦立刻下
  aiMove();
}

// ===== 電腦（先用最簡單版本）=====
function aiMove() {
  if (finished) return;

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = AI;
      break;
    }
  }

  let r = checkResult(board);
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

// ===== 啟動 =====
buildGrid();
restartGame();

btnRestart.onclick = restartGame;
btnResetScore.onclick = resetScore;
