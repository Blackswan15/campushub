const Joi = require('joi');

const createClubSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(5).required(),
  image_url: Joi.string().uri().allow('', null).optional(),
});

module.exports = { createClubSchema };
