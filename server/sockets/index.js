const { pool } = require("../db");

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    const userId = socket.userId;

    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("send_message", async ({ conversationId, text }) => {
      const result = await pool.query(
        "INSERT INTO messages (conversation_id, sender_id, text) VALUES ($1, $2, $3) RETURNING *",
        [conversationId, userId, text]
      );
      const message = result.rows[0];
      io.to(`conversation:${conversationId}`).emit("new_message", message);
    });

    socket.on("typing", ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit("typing", { userId });
    });

    socket.on("disconnect", () => {
      // presence/last-seen updates go here later
    });
  });
}

module.exports = { registerSocketHandlers };