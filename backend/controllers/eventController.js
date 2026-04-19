const {
  getApprovedEvents, getEventById, getOrganizerEvents, getPendingEvents,
  createEvent, updateEvent, updateEventStatus, getConnection,
} = require('../models/eventModel');
const { createSubEvents, getSubEventsByEventId } = require('../models/subEventModel');
const { createEventSchema, updateStatusSchema } = require('../validation/eventSchemas');

const listEvents = async (req, res) => {
  const { type, ref_id, search } = req.query;
  const events = await getApprovedEvents({ type, ref_id, search });
  res.json(events);
};

const getEvent = async (req, res) => {
  const event = await getEventById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });

  // Attach nested sub-events with seat tracking
  const subEvents = await getSubEventsByEventId(event.id);
  res.json({ ...event, sub_events: subEvents });
};

const createEventHandler = async (req, res) => {
  const { error, value } = createEventSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { subEvents, ...eventData } = value;
  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    const eventId = await createEvent({ ...eventData, created_by: req.user.id }, conn);

    if (subEvents && subEvents.length > 0) {
      await createSubEvents(eventId, subEvents, conn);
    } else {
      // Backward compat: auto-create a single "Main Event" sub-event
      await createSubEvents(eventId, [{
        name: 'Main Event',
        type: 'general',
        capacity: eventData.capacity || null,
      }], conn);
    }

    await conn.commit();
    res.status(201).json({ id: eventId, ...eventData, status: 'pending' });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const updateEventHandler = async (req, res) => {
  const event = await getEventById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  if (event.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to edit this event.' });
  }

  const { error, value } = createEventSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { subEvents, ...eventData } = value;
  const conn = await getConnection();

  try {
    await conn.beginTransaction();
    await updateEvent(req.params.id, eventData);

    const existingSubEvents = await getSubEventsByEventId(req.params.id);
    
    // Process sub-events logic
    if (subEvents && subEvents.length > 0) {
      const incomingIds = subEvents.map(se => se.id).filter(Boolean);
      const { deleteSubEvent, updateSubEvent } = require('../models/subEventModel');
      
      // 1. Delete removed sub-events
      for (const se of existingSubEvents) {
        if (!incomingIds.includes(se.id)) {
          if (se.registered_count > 0) {
            throw new Error(`Cannot delete sub-event "${se.name}" because it has ${se.registered_count} registrations.`);
          }
          await deleteSubEvent(se.id, conn);
        }
      }

      // 2. Update or Create
      for (const se of subEvents) {
        if (se.id) {
          const existing = existingSubEvents.find(e => e.id === se.id);
          if (existing && se.capacity !== null && existing.registered_count > se.capacity) {
            throw new Error(`Capacity for "${se.name}" cannot be less than current registrations (${existing.registered_count}).`);
          }
          await updateSubEvent(se.id, se, conn);
        } else {
          await createSubEvents(req.params.id, [se], conn);
        }
      }
    }

    await conn.commit();
    res.json({ message: 'Event updated successfully.' });
  } catch (err) {
    await conn.rollback();
    return res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};

const deleteEventHandler = async (req, res) => {
  const event = await getEventById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  if (event.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this event.' });
  }
  
  const { deleteEvent } = require('../models/eventModel');
  await deleteEvent(req.params.id);
  res.json({ message: 'Event deleted successfully.' });
};

const updateStatus = async (req, res) => {
  const { error, value } = updateStatusSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const event = await getEventById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });

  await updateEventStatus(req.params.id, value.status);
  res.json({ message: `Event ${value.status} successfully.` });
};

const getOrganizerEventsHandler = async (req, res) => {
  const events = await getOrganizerEvents(req.user.id);
  // Attach sub-events to each-recursion
  const enriched = await Promise.all(
    events.map(async (e) => {
      const sub_events = await getSubEventsByEventId(e.id);
      return { ...e, sub_events };
    })
  );
  res.json(enriched);
};

const getPendingEventsHandler = async (req, res) => {
  const events = await getPendingEvents();
  res.json(events);
};

// Legacy event-level registration disabled — use sub-event registration instead
// Kept for backward compatibility with old registrations
const getRegistrations = async (req, res) => {
  const event = await getEventById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });

  if (event.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized.' });
  }

  const subEvents = await getSubEventsByEventId(req.params.id);
  const { getSubEventRegistrations } = require('../models/subEventModel');
  const result = await Promise.all(
    subEvents.map(async (se) => ({
      sub_event: se,
      registrations: await getSubEventRegistrations(se.id),
    }))
  );
  res.json(result);
};

module.exports = {
  listEvents, getEvent, createEventHandler, updateEventHandler, deleteEventHandler,
  updateStatus, getOrganizerEventsHandler, getPendingEventsHandler,
  getRegistrations,
};
