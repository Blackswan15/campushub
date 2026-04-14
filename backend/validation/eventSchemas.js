const Joi = require('joi');

const subEventSchema = Joi.object({
  id: Joi.number().integer().positive().optional(),
  name: Joi.string().min(2).max(150).required(),
  type: Joi.string().valid('technical', 'non-technical', 'general').default('general'),
  capacity: Joi.number().integer().positive().optional().allow(null),
}).unknown(true);

const createEventSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).required(),
  date: Joi.date().iso().required(),
  venue: Joi.string().min(2).max(200).required(),
  type: Joi.string().valid('club', 'department').required(),
  ref_id: Joi.number().integer().positive().required(),
  capacity: Joi.number().integer().positive().optional().allow(null),
  // sub-events array (optional for backward compat)
  subEvents: Joi.array().items(subEventSchema).min(1).optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
});

module.exports = { createEventSchema, updateStatusSchema, subEventSchema };
