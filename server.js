const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 3000;

// Serve all files directly from root folder
app.use(express.static(__dirname));

// Room data storage (board state per room)
let rooms = {};

io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.on("joinRoom", (roomCode) => {
    socket.join(roomCode);
    console.log(`User joined room: ${roomCode}`);

    // Initialize room if not exists
    if (!rooms[roomCode]) {
      rooms[roomCode] = Array(9).fill("");
    }

    // Emit board state to this room
    io.to(roomCode).emit("updateBoard", rooms[roomCode]);
  });

  socket.on("playMove", ({ room, index, symbol }) => {
    if (rooms[room]) {
      rooms[room][index] = symbol;
      io.to(room).emit("updateBoard", rooms[room]);
    }
  });

  socket.on("resetGame", (roomCode) => {
    rooms[roomCode] = Array(9).fill("");
    io.to(roomCode).emit("updateBoard", rooms[roomCode]);
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected");
  });
});

// Start the server
http.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
