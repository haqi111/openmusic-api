const Joi = require('joi');

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid(
    'image/apng',
    'image/jpg',
    'image/jpeg', // Add 'image/jpeg' to allow JPG files
    'image/gif',
    'image/png',
    'image/webp',
  ).required(),
}).unknown();

module.exports = ImageHeadersSchema;
