const joi = require('joi');

const conversationSchema = joi.object({
    participantId: joi.string().hex().length(24),
    participantIds: joi.array().items(joi.string().hex().length(24)).min(1),
    name: joi.string().trim().max(100).allow(null, ''),
}).or('participantId', 'participantIds');

module.exports = { conversationSchema };