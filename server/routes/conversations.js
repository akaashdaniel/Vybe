const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
    const result = await pool.query(
    `SELECT c.id, c.name, c.is_group,
            u.id AS other_user_id, u.name AS other_user_name,
            m.text AS last_message, m.created_at AS last_message_at,
            (SELECT COUNT(*) FROM messages
             WHERE conversation_id = c.id
               AND sender_id != $1
               AND status != 'read') AS unread_count
     FROM conversations c
     JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1
     LEFT JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id != $1
     LEFT JOIN users u ON u.id = cm2.user_id
     LEFT JOIN LATERAL (
       SELECT text, created_at FROM messages
       WHERE conversation_id = c.id
       ORDER BY created_at DESC LIMIT 1
     ) m ON true
     ORDER BY m.created_at DESC NULLS LAST`,
    [req.userId]
  );
  res.json(result.rows);
});

// Message history 
router.get("/:id/messages", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const before = req.query.before; // ISO timestamp cursor for older pages

  // Verify membership before returning anyone's messages
  const membership = await pool.query(
    "SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2",
    [req.params.id, req.userId]
  );
  if (!membership.rows[0]) return res.status(403).json({ error: "Not a member" });

  const result = await pool.query(
    `SELECT id, sender_id, text, status, created_at FROM messages
     WHERE conversation_id = $1
       AND ($2::timestamptz IS NULL OR created_at < $2)
     ORDER BY created_at DESC
     LIMIT $3`,
    [req.params.id, before || null, limit]
  );
  res.json(result.rows.reverse()); // oldest-first for rendering
});

// Start (or reuse) a direct conversation with another user by their identifier
router.post("/", async (req, res) => {
  const { identifier } = req.body;
  const otherUser = await pool.query("SELECT id, name FROM users WHERE identifier = $1", [identifier]);
  if (!otherUser.rows[0]) return res.status(404).json({ error: "User not found" });
  const otherId = otherUser.rows[0].id;

  // reuse existing 1:1 conversation if one already exists between these two users
  const existing = await pool.query(
    `SELECT c.id FROM conversations c
     JOIN conversation_members m1 ON m1.conversation_id = c.id AND m1.user_id = $1
     JOIN conversation_members m2 ON m2.conversation_id = c.id AND m2.user_id = $2
     WHERE c.is_group = false LIMIT 1`,
    [req.userId, otherId]
  );
  if (existing.rows[0]) return res.json({ id: existing.rows[0].id });

  const conv = await pool.query("INSERT INTO conversations (is_group) VALUES (false) RETURNING id");
  const conversationId = conv.rows[0].id;
  await pool.query(
    "INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2), ($1, $3)",
    [conversationId, req.userId, otherId]
  );
  res.status(201).json({ id: conversationId });
});

module.exports = router;