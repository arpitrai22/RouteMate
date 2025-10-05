const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ===== MongoDB Connection =====
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/routemate", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ===== REST Routes =====
app.use("/api/auth", require("./routes/auth")); // auth routes must exist in ./routes/auth.js

// ===== HTTP + Socket.IO Server =====
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React frontend
    methods: ["GET", "POST"],
  },
});

// ===== Ride Matching State =====
let waitingUsers = [];

io.on("connection", (socket) => {
  console.log("🟢 New socket connected:", socket.id);

  // handle search request
  socket.on("start_search", (trip) => {
    console.log("🔎 User searching:", trip.id);

    // check for a match
    const match = waitingUsers.find(
      (u) =>
        u.id !== trip.id &&
        Math.abs(u.source.lat - trip.source.lat) < 0.01 &&
        Math.abs(u.source.lng - trip.source.lng) < 0.01
    );

    if (match) {
      // found a match
      io.to(socket.id).emit("match_found", { with: match.id });
      io.to(match.socketId).emit("match_found", { with: trip.id });

      // remove matched users from queue
      waitingUsers = waitingUsers.filter((u) => u.id !== match.id);
    } else {
      // no match yet → add user to waiting list
      waitingUsers.push({ ...trip, socketId: socket.id });

      // auto-timeout after 60s
      setTimeout(() => {
        waitingUsers = waitingUsers.filter((u) => u.id !== trip.id);
        io.to(socket.id).emit("no_match");
      }, 60000);

      io.to(socket.id).emit("searching");
    }
  });

  // chat join
  socket.on("join_room", ({ room }) => {
    socket.join(room);
    console.log(`📌 User ${socket.id} joined room ${room}`);
    io.to(room).emit("chat_ready", { room });
  });

  // chat messages
  socket.on("chat_message", ({ room, from, message }) => {
    io.to(room).emit("chat_message", { from, message });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
    waitingUsers = waitingUsers.filter((u) => u.socketId !== socket.id);
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
