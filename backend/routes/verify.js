const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/verify/:id — Verify a ticket / registration
router.get('/:id', async (req, res) => {
  try {
    const regId = req.params.id;
    const [rows] = await pool.query(
      `SELECT r.id AS registration_id, r.registered_at, 
              u.name AS student_name, u.email,
              se.name AS sub_event_name, se.type AS sub_event_type,
              e.title AS event_title, e.venue
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       JOIN sub_events se ON r.sub_event_id = se.id
       JOIN events e ON se.event_id = e.id
       WHERE r.id = ?`,
      [regId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ valid: false, message: 'Invalid or missing registration ticket.' });
    }

    res.json({ valid: true, ticket: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, message: 'Server error during validation' });
  }
});

module.exports = router;

