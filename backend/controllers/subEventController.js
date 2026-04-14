const {
  getSubEventById,
  getSubEventRegistrations,
  registerForSubEvent,
  isAlreadyRegisteredForSubEvent,
} = require('../models/subEventModel');
const { getEventById } = require('../models/eventModel');

// POST /api/sub-events/:id/register — student registers for a sub-event
const registerSubEvent = async (req, res) => {
  const subEventId = req.params.id;
  const userId = req.user.id;

  const subEvent = await getSubEventById(subEventId);
  if (!subEvent) return res.status(404).json({ message: 'Sub-event not found.' });

  // Check parent event status
  const event = await getEventById(subEvent.event_id);
  if (!event || event.status !== 'approved') {
    return res.status(400).json({ message: 'Event is not open for registration.' });
  }

  // Check capacity
  if (subEvent.capacity !== null && subEvent.remaining_seats <= 0) {
    return res.status(400).json({ message: 'This sub-event is full.' });
  }

  // Prevent duplicate
  const already = await isAlreadyRegisteredForSubEvent(userId, subEventId);
  if (already) {
    return res.status(409).json({ message: 'You have already registered for this event' });
  }

  const insertId = await registerForSubEvent(userId, subEventId);
  res.status(201).json({
    message: `Successfully registered for "${subEvent.name}"!`,
    registration_id: insertId,
    sub_event: subEvent.name,
    event: event.title,
  });
};

// GET /api/sub-events/:id/registrations — organizer views registrants
const getSubEventRegs = async (req, res) => {
  const subEventId = req.params.id;

  const subEvent = await getSubEventById(subEventId);
  if (!subEvent) return res.status(404).json({ message: 'Sub-event not found.' });

  const event = await getEventById(subEvent.event_id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });

  // Allow organizer (owner) or admin
  if (event.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view registrations.' });
  }

  const registrations = await getSubEventRegistrations(subEventId);
  res.json({
    sub_event: subEvent.name,
    event: event.title,
    capacity: subEvent.capacity,
    registered_count: subEvent.registered_count,
    remaining_seats: subEvent.remaining_seats,
    registrations,
  });
};

// GET /api/sub-events/:id — get a single sub-event detail
const getSubEvent = async (req, res) => {
  const subEvent = await getSubEventById(req.params.id);
  if (!subEvent) return res.status(404).json({ message: 'Sub-event not found.' });
  res.json(subEvent);
};

const deleteSubEventRoute = async (req, res) => {
  const subEventId = req.params.id;
  const subEvent = await getSubEventById(subEventId);
  if (!subEvent) return res.status(404).json({ message: 'Sub-event not found.' });

  const event = await getEventById(subEvent.event_id);
  if (event.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized.' });
  }

  if (subEvent.registered_count > 0) {
    return res.status(400).json({ message: `Cannot delete sub-event because it has ${subEvent.registered_count} registrations.` });
  }

  const { deleteSubEvent } = require('../models/subEventModel');
  await deleteSubEvent(subEventId);
  res.json({ message: 'Sub-event deleted successfully.' });
};

module.exports = { registerSubEvent, getSubEventRegs, getSubEvent, deleteSubEventRoute };
