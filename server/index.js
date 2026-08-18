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
const conversationRoutes = require("./routes/conversations");
const { registerSocketHandlers } = require("./sockets");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.get("/api/me", requireAuth, (req, res) => res.json({ userId: req.userId }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });


const { pool } = require("../db");

const onlineUsers = new Map();

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    const userId = socket.userId;

    socket.emit("presence_snapshot", Array.from(onlineUsers.keys()));

    const wasOffline = !onlineUsers.has(userId);
    onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
    if (wasOffline) {
      io.emit("presence", { userId, online: true });
    }

    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("send_message", async ({ conversationId, text }) => {
      const membership = await pool.query(
        "SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2",
        [conversationId, userId]
      );
      if (!membership.rows[0]) return;

      // is the other member currently online? if so, mark delivered right away
      const others = await pool.query(
        "SELECT user_id FROM conversation_members WHERE conversation_id = $1 AND user_id != $2",
        [conversationId, userId]
      );
      const recipientOnline = others.rows.some((r) => onlineUsers.has(r.user_id));
      const status = recipientOnline ? "delivered" : "sent";

      const result = await pool.query(
        "INSERT INTO messages (conversation_id, sender_id, text, status) VALUES ($1, $2, $3, $4) RETURNING *",
        [conversationId, userId, text, status]
      );
      const message = result.rows[0];
      io.to(`conversation:${conversationId}`).emit("new_message", message);
    });

    socket.on("mark_read", async ({ conversationId }) => {
      const result = await pool.query(
        `UPDATE messages SET status = 'read'
         WHERE conversation_id = $1 AND sender_id != $2 AND status != 'read'
         RETURNING id`,
        [conversationId, userId]
      );
      if (result.rows.length > 0) {
        io.to(`conversation:${conversationId}`).emit("messages_read", {
          conversationId,
          readerId: userId,
        });
      }
    });

    socket.on("typing", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing", { conversationId, userId });
    });

    socket.on("disconnect", async () => {
      const count = (onlineUsers.get(userId) || 1) - 1;
      if (count <= 0) {
        onlineUsers.delete(userId);
        await pool.query("UPDATE users SET last_seen_at = now() WHERE id = $1", [userId]);
        io.emit("presence", { userId, online: false, lastSeen: new Date().toISOString() });
      } else {
        onlineUsers.set(userId, count);
      }
    });
  });
}

module.exports = { registerSocketHandlers };

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