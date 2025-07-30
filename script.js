// Select elements
let btnRef = document.querySelectorAll(".button-option");
let popupRef = document.querySelector(".popup");
let newgameBtn = document.getElementById("new-game");
let restartBtn = document.getElementById("restart");
let msgRef = document.getElementById("message");

let player1Input = document.getElementById("player1-name");
let player2Input = document.getElementById("player2-name");
let startGameBtn = document.getElementById("start-game");
let playVsAIBtn = document.getElementById("play-vs-ai");
let inviteBtn = document.getElementById("invite-friend");
let roomCodeDisplay = document.getElementById("room-code");

let player1 = "Player X";
let player2 = "Player O";
let currentPlayer = "X";
let xTurn = true;
let count = 0;
let isAI = false;
let roomCode = "";

// Winning patterns
let winningPattern = [
  [0, 1, 2], [0, 3, 6], [2, 5, 8],
  [6, 7, 8], [3, 4, 5], [1, 4, 7],
  [0, 4, 8], [2, 4, 6]
];

// Disable buttons and show popup
const disableButtons = () => {
  btnRef.forEach((element) => (element.disabled = true));
  popupRef.classList.remove("hide");
};

// Enable buttons and reset grid
const enableButtons = () => {
  btnRef.forEach((element) => {
    element.innerText = "";
    element.disabled = false;
  });
  popupRef.classList.add("hide");
  msgRef.innerHTML = "";
  roomCodeDisplay.textContent = "";
  count = 0;
  xTurn = true;
  currentPlayer = "X";
};

// Win handler
const winFunction = (letter) => {
  disableButtons();
  const winnerName = letter === "X" ? player1 : player2;
  msgRef.innerHTML = `<span class='winner-text'>${winnerName} Wins</span>`;
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      confetti({ particleCount: 75, spread: 100, origin: { y: 0.6 } });
    }, i * 400);
  }
};

// Draw handler
const drawFunction = () => {
  disableButtons();
  msgRef.innerHTML = `<span class='winner-text'>It's a Draw</span>`;
};

// Check for winner
const winChecker = () => {
  for (let pattern of winningPattern) {
    let [a, b, c] = pattern;
    let val1 = btnRef[a].innerText;
    let val2 = btnRef[b].innerText;
    let val3 = btnRef[c].innerText;

    if (val1 && val1 === val2 && val2 === val3) {
      winFunction(val1);
      return true;
    }
  }
  return false;
};

// AI move logic
const makeAIMove = () => {
  let emptyCells = [];
  btnRef.forEach((btn, index) => {
    if (btn.innerText === "") emptyCells.push(index);
  });
  if (emptyCells.length === 0) return;

  let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  setTimeout(() => {
    btnRef[randomIndex].innerText = "O";
    btnRef[randomIndex].disabled = true;
    count++;
    if (!winChecker() && count === 9) drawFunction();
    xTurn = true;
  }, 500);
};

// Button click logic
btnRef.forEach((element, index) => {
  element.addEventListener("click", () => {
    if (element.innerText !== "") return;
    element.innerText = xTurn ? "X" : "O";
    element.disabled = true;
    count++;
    if (!winChecker() && count === 9) {
      drawFunction();
    } else {
      xTurn = !xTurn;
      if (isAI && !xTurn) makeAIMove();
    }
  });
});

// Restart game
restartBtn.addEventListener("click", () => enableButtons());

// New game
newgameBtn.addEventListener("click", () => enableButtons());

// Start standard 2-player game
startGameBtn.addEventListener("click", () => {
  player1 = player1Input.value || "Player X";
  player2 = player2Input.value || "Player O";
  isAI = false;
  enableButtons();
});

// Start game vs AI
playVsAIBtn.addEventListener("click", () => {
  player1 = player1Input.value || "Player";
  player2 = "Computer";
  isAI = true;
  enableButtons();
});

// Invite friend feature (mock room code)
inviteBtn.addEventListener("click", () => {
  roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  roomCodeDisplay.textContent = `Room Code: ${roomCode} (share this with a friend)`;
});

// Initialize game
window.onload = enableButtons;
