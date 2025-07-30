const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // ✅ Needed for cross-origin access from Vercel frontend
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// ✅ Serve static files from root folder
app.use(express.static(path.join(__dirname)));

// 🧠 In-memory room data (board state)
const rooms = {};

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinRoom", (roomCode) => {
    socket.join(roomCode);
    console.log(`👥 ${socket.id} joined room: ${roomCode}`);

    // Initialize board if not present
    if (!rooms[roomCode]) {
      rooms[roomCode] = Array(9).fill("");
    }

    // Emit board state to all clients in room
    io.to(roomCode).emit("updateBoard", rooms[roomCode]);
  });

  socket.on("playMove", ({ room, index, symbol }) => {
    if (rooms[room] && rooms[room][index] === "") {
      rooms[room][index] = symbol;
      io.to(room).emit("updateBoard", rooms[room]);
    }
  });

  socket.on("resetGame", (roomCode) => {
    rooms[roomCode] = Array(9).fill("");
    io.to(roomCode).emit("updateBoard", rooms[roomCode]);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
