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