// Initialize socket
const socket = io();

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

const disableButtons = () => {
  btnRef.forEach((element) => (element.disabled = true));
  popupRef.classList.remove("hide");
};

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

const drawFunction = () => {
  disableButtons();
  msgRef.innerHTML = `<span class='winner-text'>It's a Draw</span>`;
};

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

    // Multiplayer move broadcast (optional, if server supports it)
    if (!isAI && roomCode) {
      socket.emit("moveMade", {
        room: roomCode,
        index,
        value: element.innerText
      });
    }
  });
});

restartBtn.addEventListener("click", () => enableButtons());
newgameBtn.addEventListener("click", () => enableButtons());

startGameBtn.addEventListener("click", () => {
  player1 = player1Input.value || "Player X";
  player2 = player2Input.value || "Player O";
  isAI = false;
  enableButtons();
});

playVsAIBtn.addEventListener("click", () => {
  player1 = player1Input.value || "Player";
  player2 = "Computer";
  isAI = true;
  enableButtons();
});

inviteBtn.addEventListener("click", () => {
  roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  roomCodeDisplay.textContent = `Room Code: ${roomCode} (share this with a friend)`;
  socket.emit("createRoom", roomCode);
});

roomCodeDisplay.addEventListener("click", () => {
  const inputCode = prompt("Enter Room Code to Join:");
  if (!inputCode) return;
  roomCode = inputCode.toUpperCase();
  socket.emit("joinRoom", roomCode);
});

// Socket event listeners
socket.on("playerJoined", ({ id }) => {
  msgRef.innerHTML = `<span class='winner-text'>Player joined! Ready to play</span>`;
});

socket.on("moveMade", ({ index, value }) => {
  if (btnRef[index].innerText === "") {
    btnRef[index].innerText = value;
    btnRef[index].disabled = true;
    count++;
    if (!winChecker() && count === 9) drawFunction();
    xTurn = value === "X";
  }
});

// Initialize
window.onload = enableButtons;
