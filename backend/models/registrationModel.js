const pool = require('../config/db');

const registerForEvent = async (userId, eventId) => {
  const [result] = await pool.query(
    'INSERT INTO registrations (user_id, event_id) VALUES (?, ?)',
    [userId, eventId]
  );
  return result.insertId;
};

const isAlreadyRegistered = async (userId, eventId) => {
  const [rows] = await pool.query(
    'SELECT id FROM registrations WHERE user_id = ? AND event_id = ?',
    [userId, eventId]
  );
  return rows.length > 0;
};

const getMyRegistrations = async (userId) => {
  const [rows] = await pool.query(
    `SELECT e.*, r.id AS registration_id, r.registered_at, r.sub_event_id, se.name AS sub_event_name, se.type AS sub_event_type,
      CASE WHEN e.type = 'department' THEN d.name ELSE c.name END AS source_name
     FROM registrations r
     JOIN sub_events se ON r.sub_event_id = se.id
     JOIN events e ON se.event_id = e.id
     LEFT JOIN departments d ON e.type = 'department' AND e.ref_id = d.id
     LEFT JOIN clubs c ON e.type = 'club' AND e.ref_id = c.id
     WHERE r.user_id = ? ORDER BY r.registered_at DESC`,
    [userId]
  );
  return rows;
};

const getEventRegistrations = async (eventId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, r.registered_at
     FROM registrations r
     JOIN users u ON r.user_id = u.id
     JOIN sub_events se ON r.sub_event_id = se.id
     WHERE se.event_id = ? ORDER BY r.registered_at ASC`,
    [eventId]
  );
  return rows;
};

module.exports = { registerForEvent, isAlreadyRegistered, getMyRegistrations, getEventRegistrations };
