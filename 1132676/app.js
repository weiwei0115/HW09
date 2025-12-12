// ===== DOM =====
const gridEl = document.getElementById("grid");
const statusEl = document.getElementById("status");
const btnRestart = document.getElementById("btnRestart");
const btnToggleFirst = document.getElementById("btnToggleFirst");
const btnResetScore = document.getElementById("btnResetScore");
const firstLabel = document.getElementById("firstLabel");

const xWinsEl = document.getElementById("xWins");
const oWinsEl = document.getElementById("oWins");
const drawsEl = document.getElementById("draws");

// ===== State =====
let firstPlayer = "X";
let current = firstPlayer;
let board = Array(9).fill("");
let finished = false;

let score = { X: 0, O: 0, D: 0 };

const winLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6]             // diagonals
];

// ===== Build UI =====
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
    c.classList.toggle("disabled", finished || board[i] !== "");
    c.classList.remove("win");
  });

  if (!finished) {
    statusEl.innerHTML = `目前輪到：<b>${current}</b>`;
  }

  firstLabel.textContent = firstPlayer;

  xWinsEl.textContent = String(score.X);
  oWinsEl.textContent = String(score.O);
  drawsEl.textContent = String(score.D);
}

// ===== Game Logic =====
function onCellClick(e) {
  if (finished) return;

  const idx = Number(e.currentTarget.dataset.idx);
  if (Number.isNaN(idx) || board[idx] !== "") return;

  board[idx] = current;

  const result = checkResult();
  if (result.type === "WIN") {
    finished = true;
    score[current] += 1;
    statusEl.innerHTML = `勝者：<b>${current}</b>`;
    highlightWin(result.line);
  } else if (result.type === "DRAW") {
    finished = true;
    score.D += 1;
    statusEl.innerHTML = `結果：<b>平手</b>`;
  } else {
    current = (current === "X") ? "O" : "X";
  }

  render();
}

function checkResult() {
  for (const line of winLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { type: "WIN", line };
    }
  }
  if (board.every(v => v !== "")) return { type: "DRAW" };
  return { type: "NONE" };
}

function highlightWin(line) {
  const cells = gridEl.querySelectorAll(".cell");
  line.forEach(i => cells[i].classList.add("win"));
}

function restartGame() {
  board = Array(9).fill("");
  finished = false;
  current = firstPlayer;
  render();
}

function toggleFirstPlayer() {
  firstPlayer = (firstPlayer === "X") ? "O" : "X";
  restartGame();
}

function resetScore() {
  score = { X: 0, O: 0, D: 0 };
  restartGame();
}

// ===== Init =====
buildGrid();
render();

btnRestart.addEventListener("click", restartGame);
btnToggleFirst.addEventListener("click", toggleFirstPlayer);
btnResetScore.addEventListener("click", resetScore);
