const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signupSchema, loginSchema } = require('../validation/authSchemas');
const { findByEmail, createUser, findById } = require('../models/userModel');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const signup = async (req, res) => {
  const { error, value } = signupSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, email, password, role } = value;

  const existing = await findByEmail(email);
  if (existing) return res.status(409).json({ message: 'Email already registered.' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userId = await createUser(name, email, hashedPassword, role || 'student');
  const user = await findById(userId);

  const token = generateToken(user);
  res.status(201).json({ token, user });
};

const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = value;

  const user = await findByEmail(email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = generateToken(safeUser);
  res.json({ token, user: safeUser });
};

const getMe = async (req, res) => {
  const user = await findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
};

module.exports = { signup, login, getMe };
