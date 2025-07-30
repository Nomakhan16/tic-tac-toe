const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// CORS for HTTP routes
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

// Serve static files
app.use(express.static(path.join(__dirname)));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const rooms = {};

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("createRoom", (roomCode) => {
    socket.join(roomCode);
    rooms[roomCode] = Array(9).fill("");
    socket.emit("playerJoined", { id: socket.id });
  });

  socket.on("joinRoom", (roomCode) => {
    socket.join(roomCode);
    if (!rooms[roomCode]) rooms[roomCode] = Array(9).fill("");
    io.to(roomCode).emit("playerJoined", { id: socket.id });
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
