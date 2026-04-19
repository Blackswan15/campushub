const express = require('express');
const router = express.Router();
const { registerSubEvent, getSubEventRegs, getSubEvent, deleteSubEventRoute } = require('../controllers/subEventController');
const { verifyToken } = require('../middleware/auth');
const { requireOrganizer } = require('../middleware/roles');

router.get('/:id', getSubEvent);

router.post('/:id/register', verifyToken, registerSubEvent);

router.get('/:id/registrations', verifyToken, requireOrganizer, getSubEventRegs);

router.delete('/:id', verifyToken, requireOrganizer, deleteSubEventRoute);

module.exports = router;
