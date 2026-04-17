const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided.' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await db.query('SELECT id FROM users WHERE id = ?', [decoded.id]);
    if (!rows.length) {
      return res.status(401).json({ error: 'User not found. Please sign in again.' });
    }
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};