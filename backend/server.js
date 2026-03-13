const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://route-mate-murex.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: ["https://route-mate-murex.vercel.app", "http://localhost:5173"],
  }),
);
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "RouteMate API is running!" });
});

// ─────────────────────────────────────────
// In-memory stores
// ─────────────────────────────────────────

// Active searchers
// { socketId: { userId, userName, sourceLat, sourceLng, sourceName, destinationLat, destinationLng, destinationName, radius } }
const activeSearchers = new Map();

// Match acceptances
// { matchId: [userId1, userId2] }
const matchAcceptances = new Map();

// Match socket IDs
// { matchId: [socketId1, socketId2] }
const matchSockets = new Map();

// ─────────────────────────────────────────
// Haversine distance in km
// ─────────────────────────────────────────
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ─────────────────────────────────────────
// Generate unique match ID
// ─────────────────────────────────────────
const generateMatchId = (id1, id2) => {
  return [id1, id2].sort().join("_") + "_" + Date.now();
};

// ─────────────────────────────────────────
// Socket.io
// ─────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ── Find Match ─────────────────────────────────────────
  socket.on("findMatch", (data) => {
    console.log(`${data.userName} is searching for a match...`);

    // Add to active searchers
    activeSearchers.set(socket.id, { ...data, socketId: socket.id });

    // Search for a match
    let matchFound = false;

    for (const [otherSocketId, otherSearcher] of activeSearchers) {
      if (otherSocketId === socket.id) continue;
      if (otherSearcher.userId === data.userId) continue;

      const sourceDistance = getDistance(
        data.sourceLat,
        data.sourceLng,
        otherSearcher.sourceLat,
        otherSearcher.sourceLng,
      );

      const destDistance = getDistance(
        data.destinationLat,
        data.destinationLng,
        otherSearcher.destinationLat,
        otherSearcher.destinationLng,
      );

      const radius = Math.min(data.radius, otherSearcher.radius);

      console.log(
        `Source distance: ${sourceDistance.toFixed(2)}km, Dest distance: ${destDistance.toFixed(2)}km`,
      );

      if (sourceDistance <= radius && destDistance <= radius) {
        matchFound = true;

        const matchId = generateMatchId(data.userId, otherSearcher.userId);

        // Remove both from active searchers
        activeSearchers.delete(socket.id);
        activeSearchers.delete(otherSocketId);

        // Notify User A
        socket.emit("matchFound", {
          matchId,
          matchedUserName: otherSearcher.userName,
          matchedUserId: otherSearcher.userId,
          matchedSourceName: otherSearcher.sourceName,
          matchedDestinationName: otherSearcher.destinationName,
          sourceName: data.sourceName,
          destinationName: data.destinationName,
        });

        // Notify User B
        io.to(otherSocketId).emit("matchFound", {
          matchId,
          matchedUserName: data.userName,
          matchedUserId: data.userId,
          matchedSourceName: data.sourceName,
          matchedDestinationName: data.destinationName,
          sourceName: otherSearcher.sourceName,
          destinationName: otherSearcher.destinationName,
        });

        console.log(
          `Match found between ${data.userName} and ${otherSearcher.userName}`,
        );
        break;
      }
    }

    if (!matchFound) {
      console.log(`No immediate match for ${data.userName}, waiting...`);
    }
  });

  // ── Accept Match ───────────────────────────────────────
  socket.on("acceptMatch", ({ matchId, userId }) => {
    // Track socket IDs for this match
    if (!matchSockets.has(matchId)) {
      matchSockets.set(matchId, []);
    }
    const sockets = matchSockets.get(matchId);
    if (!sockets.includes(socket.id)) {
      sockets.push(socket.id);
    }

    // Track user acceptances
    if (!matchAcceptances.has(matchId)) {
      matchAcceptances.set(matchId, []);
    }
    const acceptances = matchAcceptances.get(matchId);
    if (!acceptances.includes(userId)) {
      acceptances.push(userId);
    }

    console.log(`Match ${matchId} acceptances: ${acceptances.length}/2`);

    // Both users accepted
    if (acceptances.length === 2) {
      matchAcceptances.delete(matchId);
      const matchSocketIds = matchSockets.get(matchId) || [];
      matchSockets.delete(matchId);

      // Emit directly to each socket
      matchSocketIds.forEach((socketId) => {
        io.to(socketId).emit("bothAccepted", { matchId });
      });

      console.log(`Both users accepted match ${matchId}`);
    }
  });

  // ── Cancel Match ───────────────────────────────────────
  socket.on("cancelMatch", ({ matchId, userId }) => {
    const matchSocketIds = matchSockets.get(matchId) || [];
    matchSocketIds.forEach((socketId) => {
      io.to(socketId).emit("matchRejected");
    });
    matchAcceptances.delete(matchId);
    matchSockets.delete(matchId);
    console.log(`Match ${matchId} cancelled by ${userId}`);
  });

  // ── Join Chat Room ─────────────────────────────────────
  socket.on("joinRoom", ({ matchId, userId, userName }) => {
    socket.join(matchId);
    socket.to(matchId).emit("userJoined", { userName });
    console.log(`${userName} joined room ${matchId}`);
  });

  // ── Send Message ───────────────────────────────────────
  socket.on("sendMessage", (message) => {
    socket.to(message.matchId).emit("receiveMessage", message);
    console.log(`Message in room ${message.matchId}: ${message.text}`);
  });

  // ── Leave Room ─────────────────────────────────────────
  socket.on("leaveRoom", ({ matchId, userId, userName }) => {
    socket.leave(matchId);
    socket.to(matchId).emit("userLeft", { userName });
    console.log(`${userName} left room ${matchId}`);
  });

  // ── Disconnect ─────────────────────────────────────────
  socket.on("disconnect", () => {
    activeSearchers.delete(socket.id);
    console.log("User disconnected:", socket.id);
  });
});

// ─────────────────────────────────────────
// MongoDB connection
// ─────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
