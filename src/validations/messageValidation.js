const joi = require('joi');

const messageSchema = joi.object({
    content: joi.string().trim().min(1).required(),
});

module.exports = { messageSchema };