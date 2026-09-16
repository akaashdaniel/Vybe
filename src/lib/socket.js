import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (socket) return socket;
  const token = localStorage.getItem("token");
  socket = io(import.meta.env.VITE_API_URL || "http://localhost:4000", {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}