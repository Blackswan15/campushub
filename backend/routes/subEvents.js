const express = require('express');
const router = express.Router();
const { registerSubEvent, getSubEventRegs, getSubEvent, deleteSubEventRoute } = require('../controllers/subEventController');
const { verifyToken } = require('../middleware/auth');
const { requireOrganizer } = require('../middleware/roles');

// Get a single sub-event detail (public)
router.get('/:id', getSubEvent);

// Register a student for a specific sub-event
router.post('/:id/register', verifyToken, registerSubEvent);

// Organizer views registrations for a sub-event
router.get('/:id/registrations', verifyToken, requireOrganizer, getSubEventRegs);

// Organizer deletes a specific sub-event
router.delete('/:id', verifyToken, requireOrganizer, deleteSubEventRoute);

module.exports = router;
