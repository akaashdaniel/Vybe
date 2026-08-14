require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const { initSchema } = require("./db");
const authRoutes = require("./routes/auth");
const { requireAuth } = require("./middleware/auth");
const { registerSocketHandlers } = require("./sockets");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.get("/api/me", requireAuth, (req, res) => res.json({ userId: req.userId }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Socket auth: token passed via `auth: { token }` on the client connect call
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.userId;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

async function start() {
  await initSchema();

  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  await pubClient.connect();
  await subClient.connect();
  io.adapter(createAdapter(pubClient, subClient));

  registerSocketHandlers(io);

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => console.log(`Server running on :${PORT}`));
}

start();