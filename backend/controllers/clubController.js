const { getAllClubs, getClubById, createClub, approveClub, deleteClub, getPendingClubs } = require('../models/clubModel');
const { createClubSchema } = require('../validation/clubSchemas');
const pool = require('../config/db');

const listClubs = async (req, res) => {
  const clubs = await getAllClubs(true); // approved only for public
  res.json(clubs);
};

const requestClub = async (req, res) => {
  const { error, value } = createClubSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, description, image_url } = value;
  const id = await createClub(name, description, req.user.id, image_url);

  // Update user role to pending_org if they're a student
  if (req.user.role === 'student') {
    await pool.query('UPDATE users SET role = ? WHERE id = ?', ['pending_org', req.user.id]);
  }

  res.status(201).json({ id, name, description, approved: false });
};

const approveClubHandler = async (req, res) => {
  const { id } = req.params;
  const club = await getClubById(id);
  if (!club) return res.status(404).json({ message: 'Club not found.' });

  await approveClub(id);
  // Promote creator to organizer
  await pool.query('UPDATE users SET role = ? WHERE id = ?', ['organizer', club.created_by]);

  res.json({ message: 'Club approved successfully.' });
};

const deleteClubHandler = async (req, res) => {
  const { id } = req.params;
  const club = await getClubById(id);
  if (!club) return res.status(404).json({ message: 'Club not found.' });
  await deleteClub(id);
  res.json({ message: 'Club deleted.' });
};

const pendingClubs = async (req, res) => {
  const clubs = await getPendingClubs();
  res.json(clubs);
};

module.exports = { listClubs, requestClub, approveClubHandler, deleteClubHandler, pendingClubs };
