// frontend/src/services/socket.js
import { io } from "socket.io-client";

let socket = null;

// initialize socket after login
export function initSocket(token, userId) {
  if (!socket) {
    socket = io("http://localhost:5000", {
      auth: { token },
      query: { userId },
    });
    console.log("🔌 Socket initialized for user:", userId);
  }
  return socket;
}

// get current socket instance
export function getSocket() {
  return socket;
}

// disconnect socket (logout)
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected");
  }
}

