let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameMode = "";
let gameActive = false;
let player1Name = "";
let player2Name = "";

function selectMode(mode) {
  gameMode = mode;
  document.getElementById("nameInputs").classList.remove("hidden");
  if (mode === "friend") {
    document.getElementById("player2").classList.remove("hidden");
  } else {
    document.getElementById("player2").classList.add("hidden");
  }
}

function startGame() {
  player1Name = document.getElementById("player1").value || "Player 1";
  player2Name = gameMode === "friend" ? (document.getElementById("player2").value || "Player 2") : "Computer";

  document.querySelector(".mode-selection").classList.add("hidden");
  document.querySelector(".game-container").classList.remove("hidden");
  gameActive = true;
  updateTurnText();
}

function updateTurnText() {
  document.getElementById("turnIndicator").innerText =
    `${currentPlayer === "X" ? player1Name : player2Name}'s Turn (${currentPlayer})`;
}

function makeMove(index) {
  if (!gameActive || board[index] !== "") return;

  board[index] = currentPlayer;
  document.getElementsByClassName("cell")[index].innerText = currentPlayer;

  if (checkWinner()) {
    endGame(`${currentPlayer === "X" ? player1Name : player2Name} wins!`);
    return;
  }

  if (!board.includes("")) {
    endGame("It's a draw!");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnText();

  if (gameMode === "computer" && currentPlayer === "O") {
    setTimeout(() => makeMove(getBestMove()), 400);
  }
}

function checkWinner() {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  return winPatterns.some(pattern => 
    board[pattern[0]] && 
    board[pattern[0]] === board[pattern[1]] && 
    board[pattern[1]] === board[pattern[2]]
  );
}

function endGame(message) {
  gameActive = false;
  document.querySelector(".game-container").classList.add("hidden");
  document.getElementById("winnerScreen").classList.remove("hidden");
  document.getElementById("winnerMessage").innerText = message;

  confetti({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.6 }
  });
}

function restartGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  document.querySelectorAll(".cell").forEach(cell => cell.innerText = "");
  document.getElementById("winnerScreen").classList.add("hidden");
  document.querySelector(".game-container").classList.remove("hidden");
  updateTurnText();
}

// ---------------- Smart AI using MiniMax ----------------
function getBestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newBoard, depth, isMaximizing) {
  let result = checkMiniMaxWinner();
  if (result !== null) {
    if (result === "O") return 10 - depth;
    if (result === "X") return depth - 10;
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "O";
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "X";
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkMiniMaxWinner() {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (!board.includes("")) return "draw";
  return null;
}
