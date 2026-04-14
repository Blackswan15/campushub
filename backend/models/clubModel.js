const pool = require('../config/db');

const getAllClubs = async (approvedOnly = false) => {
  let query = `
    SELECT clubs.*, users.name AS organizer_name 
    FROM clubs 
    LEFT JOIN users ON clubs.created_by = users.id
  `;
  if (approvedOnly) query += ' WHERE clubs.approved = 1';
  query += ' ORDER BY clubs.name';
  const [rows] = await pool.query(query);
  return rows;
};

const getClubById = async (id) => {
  const [rows] = await pool.query(
    `SELECT clubs.*, users.name AS organizer_name 
     FROM clubs LEFT JOIN users ON clubs.created_by = users.id 
     WHERE clubs.id = ?`,
    [id]
  );
  return rows[0];
};

const createClub = async (name, description, createdBy, imageUrl) => {
  const [result] = await pool.query(
    'INSERT INTO clubs (name, description, created_by, approved, image_url) VALUES (?, ?, ?, 0, ?)',
    [name, description, createdBy, imageUrl || null]
  );
  return result.insertId;
};

const approveClub = async (id) => {
  await pool.query('UPDATE clubs SET approved = 1 WHERE id = ?', [id]);
};

const deleteClub = async (id) => {
  await pool.query('DELETE FROM clubs WHERE id = ?', [id]);
};

const getPendingClubs = async () => {
  const [rows] = await pool.query(
    `SELECT clubs.*, users.name AS organizer_name 
     FROM clubs LEFT JOIN users ON clubs.created_by = users.id 
     WHERE clubs.approved = 0 ORDER BY clubs.id DESC`
  );
  return rows;
};

module.exports = { getAllClubs, getClubById, createClub, approveClub, deleteClub, getPendingClubs };
