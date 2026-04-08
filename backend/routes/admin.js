const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all applications
router.get('/applications', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM applications ORDER BY created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch applications.' });
    }
});

// SCHEDULE appointment
router.post('/schedule-appointment', async (req, res) => {
    const { application_id, appointment_date, appointment_time, appointment_center, officer_notes } = req.body;
    try {
        await db.query(
            `UPDATE applications SET
                appointment_date = ?,
                appointment_time = ?,
                appointment_center = ?,
                officer_notes = ?,
                status = CASE WHEN status = 'Payment Done' THEN 'Under Review' ELSE status END
             WHERE application_id = ?`,
            [appointment_date, appointment_time, appointment_center, officer_notes, application_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to schedule appointment.' });
    }
});

// UPDATE status
router.post('/update-status', async (req, res) => {
    const { application_id, status, rejected_reason } = req.body;
    try {
        await db.query(
            `UPDATE applications SET status = ?, rejected_reason = ? WHERE application_id = ?`,
            [status, rejected_reason || null, application_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status.' });
    }
});

// VERIFY documents
router.post('/verify-documents', async (req, res) => {
    const { application_id, documents_status, officer_notes } = req.body;
    try {
        await db.query(
            `UPDATE applications SET documents_status = ?, officer_notes = ? WHERE application_id = ?`,
            [documents_status, officer_notes, application_id]
        );
        // Auto-advance status if both verified
        if (documents_status === 'Verified') {
            const [rows] = await db.query(
                'SELECT police_status FROM applications WHERE application_id = ?',
                [application_id]
            );
            if (rows[0]?.police_status === 'Cleared') {
                await db.query(
                    "UPDATE applications SET status = 'Verified' WHERE application_id = ?",
                    [application_id]
                );
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to verify documents.' });
    }
});

// POLICE verification
router.post('/verify-police', async (req, res) => {
    const { application_id, police_status, officer_notes } = req.body;
    try {
        await db.query(
            `UPDATE applications SET police_status = ?, officer_notes = ? WHERE application_id = ?`,
            [police_status, officer_notes, application_id]
        );
        // Auto-advance status if both cleared
        if (police_status === 'Cleared') {
            const [rows] = await db.query(
                'SELECT documents_status FROM applications WHERE application_id = ?',
                [application_id]
            );
            if (rows[0]?.documents_status === 'Verified') {
                await db.query(
                    "UPDATE applications SET status = 'Verified' WHERE application_id = ?",
                    [application_id]
                );
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update police verification.' });
    }
});

module.exports = router;