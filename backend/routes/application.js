const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// SUBMIT APPLICATION
router.post('/submit', verifyToken, async (req, res) => {
  const {
    full_name, gender, dob, mobile, email,
    address, state, city, pincode,
    service_type, application_type, booklet_type,
    proof_type, proof_number
  } = req.body;

  const appId = 'SP' + Date.now();

  try {
    await db.query(
      `INSERT INTO applications 
       (user_id, application_id, full_name, gender, dob, mobile, email,
        address, state, city, pincode, service_type, application_type,
        booklet_type, proof_type, proof_number)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [req.user.id, appId, full_name, gender, dob, mobile, email,
       address, state, city, pincode, service_type, application_type,
       booklet_type, proof_type, proof_number]
    );
    res.json({ success: true, application_id: appId });
  } catch (err) {
    console.error('❌ Application submit failed:', {
      code: err?.code,
      errno: err?.errno,
      sqlState: err?.sqlState,
      message: err?.message
    });
    res.status(500).json({
      error: 'Failed to submit application.',
      details: process.env.NODE_ENV === 'production'
        ? undefined
        : { code: err?.code, message: err?.message }
    });
  }
});

// GET APPLICATION STATUS
router.get('/status/:appId', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM applications WHERE application_id = ? AND user_id = ?',
      [req.params.appId, req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ error: 'Application not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;