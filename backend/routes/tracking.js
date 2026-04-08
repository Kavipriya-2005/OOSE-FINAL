// backend/routes/admin.js
// Simple admin route to update application status
// Add this to server.js: app.use('/api/admin', require('./routes/admin'));

const express = require('express');
const router = express.Router();
const db = require('../db');

const VALID_STATUSES = [
  'Submitted',
  'Payment Done',
  'Under Review',
  'Police Verification',
  'Verified',
  'Printing',
  'Dispatched',
  'Rejected'
];

// Update application status (admin use)
// POST /api/admin/update-status
// Body: { application_id, status, admin_key }
router.post('/update-status', async (req, res) => {
  const { application_id, status, admin_key } = req.body;

  // Simple admin key check (replace with proper auth in production)
  if (admin_key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.', valid: VALID_STATUSES });
  }

  try {
    const [result] = await db.query(
      'UPDATE applications SET status = ? WHERE application_id = ?',
      [status, application_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    res.json({ success: true, message: `Status updated to "${status}"` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET all applications (admin dashboard)
router.get('/applications', async (req, res) => {
  const { admin_key } = req.query;
  if (admin_key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT application_id, full_name, email, service_type, 
       application_type, status, created_at 
       FROM applications ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;