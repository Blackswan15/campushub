const pool = require('../config/db');

const createSubEvents = async (eventId, subEvents, conn) => {
  const db = conn || pool;
  const results = [];
  for (const se of subEvents) {
    const [r] = await db.query(
      `INSERT INTO sub_events (event_id, name, type, capacity) VALUES (?, ?, ?, ?)`,
      [eventId, se.name, se.type || 'general', se.capacity || null]
    );
    results.push(r.insertId);
  }
  return results;
};

const getSubEventsByEventId = async (eventId) => {
  const [rows] = await pool.query(
    `SELECT se.*,
       (SELECT COUNT(*) FROM registrations r WHERE r.sub_event_id = se.id) AS registered_count
     FROM sub_events se
     WHERE se.event_id = ?
     ORDER BY se.type, se.name`,
    [eventId]
  );
  return rows.map(se => ({
    ...se,
    remaining_seats: se.capacity !== null ? se.capacity - se.registered_count : null,
  }));
};

const getSubEventById = async (id) => {
  const [rows] = await pool.query(
    `SELECT se.*,
       (SELECT COUNT(*) FROM registrations r WHERE r.sub_event_id = se.id) AS registered_count
     FROM sub_events se WHERE se.id = ?`,
    [id]
  );
  if (!rows[0]) return null;
  const se = rows[0];
  return { ...se, remaining_seats: se.capacity !== null ? se.capacity - se.registered_count : null };
};

const getSubEventRegistrations = async (subEventId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, r.registered_at
     FROM registrations r
     JOIN users u ON r.user_id = u.id
     WHERE r.sub_event_id = ?
     ORDER BY r.registered_at ASC`,
    [subEventId]
  );
  return rows;
};

const registerForSubEvent = async (userId, subEventId) => {
  const [result] = await pool.query(
    `INSERT INTO registrations (user_id, sub_event_id) VALUES (?, ?)`,
    [userId, subEventId]
  );
  return result.insertId;
};

const isAlreadyRegisteredForSubEvent = async (userId, subEventId) => {
  const [rows] = await pool.query(
    `SELECT id FROM registrations WHERE user_id = ? AND sub_event_id = ?`,
    [userId, subEventId]
  );
  return rows.length > 0;
};

const updateSubEvent = async (id, { name, type, capacity }, conn) => {
  const db = conn || pool;
  await db.query(
    `UPDATE sub_events SET name=?, type=?, capacity=? WHERE id=?`,
    [name, type || 'general', capacity || null, id]
  );
};

const deleteSubEvent = async (id, conn) => {
  const db = conn || pool;
  await db.query(`DELETE FROM sub_events WHERE id=?`, [id]);
};

module.exports = {
  createSubEvents,
  getSubEventsByEventId,
  getSubEventById,
  getSubEventRegistrations,
  registerForSubEvent,
  isAlreadyRegisteredForSubEvent,
  updateSubEvent,
  deleteSubEvent,
};
