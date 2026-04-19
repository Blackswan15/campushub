const pool = require('../config/db');

// Get all registrations for a specific user (used by /registrations/me)
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

module.exports = { getMyRegistrations };
