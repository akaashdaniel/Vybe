const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, identifier, password } = req.body;
  if (!name || !identifier || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, identifier, password_hash) VALUES ($1, $2, $3) RETURNING id, name, identifier",
      [name, identifier, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Account already exists" });
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE identifier = $1", [identifier]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, identifier: user.identifier } });
});

module.exports = router;