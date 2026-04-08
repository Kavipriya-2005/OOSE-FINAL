const express = require('express');
const router = express.Router();
const db = require('../db');

// Simple payment record (without Razorpay for now)
router.post('/confirm', async (req, res) => {
  const { application_id, amount } = req.body;
  try {
    await db.query(
      `INSERT INTO payments (application_id, amount, status, paid_at) 
       VALUES (?, ?, 'Paid', NOW())`,
      [application_id, amount]
    );
    await db.query(
      `UPDATE applications SET status = 'Payment Done' 
       WHERE application_id = ?`,
      [application_id]
    );
    res.json({ success: true, message: 'Payment recorded.' });
  } catch (err) {
    res.status(500).json({ error: 'Payment failed.' });
  }
});

module.exports = router;