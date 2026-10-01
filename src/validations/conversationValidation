const joi = require('joi');

const conversationSchema = joi.object({
    participantId: joi.string().hex().length(24).required(),
});

module.exports = { conversationSchema };