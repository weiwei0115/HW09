const gridEl = document.getElementById("grid");
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

let board, finished, locked;
let score = { X:0, O:0, D:0 };

function buildGrid() {
  gridEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const c = document.createElement("div");
    c.className = "cell";
    c.dataset.idx = i;
    c.onclick = onCellClick;
    gridEl.appendChild(c);
  }
}

function render() {
  document.querySelectorAll(".cell").forEach((c,i)=>{
    c.textContent = board[i];
    c.classList.toggle("disabled", finished || locked || board[i] !== "");
    c.classList.remove("win");
  });
  xWinsEl.textContent = score.X;
  oWinsEl.textContent = score.O;
  drawsEl.textContent = score.D;
}

function getResult(b){
  for (const l of winLines){
    const [a,b1,c] = l;
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
      return { type:"WIN", winner:b[a], line:l };
    }
  }
  if (b.every(v=>v)) return { type:"DRAW" };
  return { type:"NONE" };
}

function highlight(line){
  document.querySelectorAll(".cell").forEach((c,i)=>{
    if (line.includes(i)) c.classList.add("win");
  });
}

function onCellClick(e){
  if (finished || locked) return;
  const i = +e.target.dataset.idx;
  if (board[i]) return;

  board[i] = HUMAN;
  let r = getResult(board);
  if (r.type === "WIN") {
    finished = true;
    score.X++;
    statusEl.innerHTML = "你獲勝（X）";
    render(); highlight(r.line); return;
  }
  if (r.type === "DRAW") {
    finished = true;
    score.D++;
    statusEl.innerHTML = "平手";
    render(); return;
  }

  locked = true;
  statusEl.innerHTML = "電腦回合（O）";
  render();

  setTimeout(aiMove, 300);
}

function aiMove(){
  const move = findBestMove([...board]);
  if (move !== -1) board[move] = AI;

  let r = getResult(board);
  if (r.type === "WIN") {
    finished = true;
    score.O++;
    statusEl.innerHTML = "電腦獲勝（O）";
    locked = false;
    render(); highlight(r.line); return;
  }
  if (r.type === "DRAW") {
    finished = true;
    score.D++;
    statusEl.innerHTML = "平手";
    locked = false;
    render(); return;
  }

  locked = false;
  statusEl.innerHTML = "你的回合（X）";
  render();
}

function findBestMove(b){
  let best = -Infinity, move = -1;
  for (let i=0;i<9;i++){
    if (!b[i]){
      b[i]=AI;
      let score = minimax(b,0,false);
      b[i]="";
      if (score>best){
        best=score; move=i;
      }
    }
  }
  return move;
}

function minimax(b,depth,isMax){
  let r = getResult(b);
  if (r.type==="WIN") return r.winner===AI ? 10-depth : depth-10;
  if (r.type==="DRAW") return 0;

  if (isMax){
    let best=-Infinity;
    for (let i=0;i<9;i++){
      if (!b[i]){
        b[i]=AI;
        best=Math.max(best,minimax(b,depth+1,false));
        b[i]="";
      }
    }
    return best;
  } else {
    let best=Infinity;
    for (let i=0;i<9;i++){
      if (!b[i]){
        b[i]=HUMAN;
        best=Math.min(best,minimax(b,depth+1,true));
        b[i]="";
      }
    }
    return best;
  }
}

function restartGame(){
  board = Array(9).fill("");
  finished = false;
  locked = false;
  statusEl.innerHTML = "你的回合（X）";
  render();
}

function resetScore(){
  score = { X:0, O:0, D:0 };
  restartGame();
}

buildGrid();
restartGame();
btnRestart.onclick = restartGame;
btnResetScore.onclick = resetScore;
