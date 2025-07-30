const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ Enable CORS globally for HTTP routes
app.use(cors({
  origin: "*", // 🔒 No trailing slash
  methods: ["GET", "POST"]
}));

// ✅ Serve static files from root folder
app.use(express.static(path.join(__dirname)));

const io = new Server(server, {
  cors: {
    origin: "*", // 🔒 Match frontend exactly
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// 🧠 In-memory room data
const rooms = {};

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinRoom", (roomCode) => {
    socket.join(roomCode);
    console.log(`👥 ${socket.id} joined room: ${roomCode}`);

    if (!rooms[roomCode]) {
      rooms[roomCode] = Array(9).fill("");
    }

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
