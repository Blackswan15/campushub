const pool = require('../config/db');

const getApprovedEvents = async ({ type, ref_id, search } = {}) => {
  let query = `
    SELECT e.*, u.name AS organizer_name,
      CASE WHEN e.type = 'department' THEN d.name ELSE c.name END AS source_name,
      (SELECT COUNT(*) FROM registrations r JOIN sub_events se ON r.sub_event_id = se.id WHERE se.event_id = e.id) AS registration_count
    FROM events e
    LEFT JOIN users u ON e.created_by = u.id
    LEFT JOIN departments d ON e.type = 'department' AND e.ref_id = d.id
    LEFT JOIN clubs c ON e.type = 'club' AND e.ref_id = c.id
    WHERE e.status = 'approved'
  `;
  const params = [];

  if (type) { query += ' AND e.type = ?'; params.push(type); }
  if (ref_id) { query += ' AND e.ref_id = ?'; params.push(ref_id); }
  if (search) { query += ' AND (e.title LIKE ? OR e.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  query += ' ORDER BY e.date ASC';
  const [rows] = await pool.query(query, params);
  return rows;
};

const getEventById = async (id) => {
  const [rows] = await pool.query(
    `SELECT e.*, u.name AS organizer_name,
      CASE WHEN e.type = 'department' THEN d.name ELSE c.name END AS source_name,
      (SELECT COUNT(*) FROM registrations r JOIN sub_events se ON r.sub_event_id = se.id WHERE se.event_id = e.id) AS registration_count
     FROM events e
     LEFT JOIN users u ON e.created_by = u.id
     LEFT JOIN departments d ON e.type = 'department' AND e.ref_id = d.id
     LEFT JOIN clubs c ON e.type = 'club' AND e.ref_id = c.id
     WHERE e.id = ?`,
    [id]
  );
  return rows[0];
};

const getOrganizerEvents = async (userId) => {
  const [rows] = await pool.query(
    `SELECT e.*,
      CASE WHEN e.type = 'department' THEN d.name ELSE c.name END AS source_name,
      (SELECT COUNT(*) FROM registrations r JOIN sub_events se ON r.sub_event_id = se.id WHERE se.event_id = e.id) AS registration_count
     FROM events e
     LEFT JOIN departments d ON e.type = 'department' AND e.ref_id = d.id
     LEFT JOIN clubs c ON e.type = 'club' AND e.ref_id = c.id
     WHERE e.created_by = ? ORDER BY e.created_at DESC`,
    [userId]
  );
  return rows;
};

const getPendingEvents = async () => {
  const [rows] = await pool.query(
    `SELECT e.*, u.name AS organizer_name,
      CASE WHEN e.type = 'department' THEN d.name ELSE c.name END AS source_name
     FROM events e
     LEFT JOIN users u ON e.created_by = u.id
     LEFT JOIN departments d ON e.type = 'department' AND e.ref_id = d.id
     LEFT JOIN clubs c ON e.type = 'club' AND e.ref_id = c.id
     WHERE e.status = 'pending' ORDER BY e.created_at DESC`
  );
  return rows;
};

// Returns a connection from the pool (for transactions)
const getConnection = () => pool.getConnection();

const createEvent = async ({ title, description, date, venue, created_by, type, ref_id, capacity }, conn) => {
  const db = conn || pool;
  const [result] = await db.query(
    `INSERT INTO events (title, description, date, venue, created_by, type, ref_id, capacity, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [title, description, date, venue, created_by, type, ref_id, capacity || null]
  );
  return result.insertId;
};

const updateEvent = async (id, { title, description, date, venue, type, ref_id, capacity }) => {
  await pool.query(
    `UPDATE events SET title=?, description=?, date=?, venue=?, type=?, ref_id=?, capacity=? WHERE id=?`,
    [title, description, date, venue, type, ref_id, capacity || null, id]
  );
};

const updateEventStatus = async (id, status) => {
  await pool.query('UPDATE events SET status = ? WHERE id = ?', [status, id]);
};

const deleteEvent = async (id) => {
  await pool.query('DELETE FROM events WHERE id = ?', [id]);
};

module.exports = {
  getApprovedEvents, getEventById, getOrganizerEvents, getPendingEvents,
  createEvent, updateEvent, updateEventStatus, deleteEvent, getConnection,
};
