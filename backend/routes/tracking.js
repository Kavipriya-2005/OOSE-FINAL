const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:appId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT application_id, full_name, service_type, application_type,
       status, created_at, appointment_date, appointment_time,
       appointment_center, officer_notes, police_status,
       documents_status, rejected_reason
       FROM applications WHERE application_id = ?`,
      [req.params.appId]
    );
    if (!rows.length)
      return res.status(404).json({ error: 'Application not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;