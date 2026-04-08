const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

// SIGN UP
router.post('/signup', async (req, res) => {
  const { full_name, email, password } = req.body;
  if (!full_name || !email || !password)
    return res.status(400).json({ error: 'All fields are required.' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
      [full_name, email, hashed]
    );
    res.json({ success: true, message: 'Account created successfully!' });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists.' });
  }
});

// SIGN IN
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'All fields are required.' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length)
      return res.status(401).json({ error: 'User not found.' });

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match)
      return res.status(401).json({ error: 'Wrong password.' });

    const token = jwt.sign(
      { id: rows[0].id, name: rows[0].full_name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ success: true, token, name: rows[0].full_name });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;