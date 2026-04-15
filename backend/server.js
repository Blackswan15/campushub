require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/departments');
const clubRoutes = require('./routes/clubs');
const eventRoutes = require('./routes/events');
const adminRoutes = require('./routes/admin');
const registrationRoutes = require('./routes/registrations');
const subEventRoutes = require('./routes/subEvents');
const verifyRoutes = require('./routes/verify');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/sub-events', subEventRoutes);
app.use('/api/verify', verifyRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CampusHub backend running on http://localhost:${PORT}`);
});
