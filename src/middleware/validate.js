/**
 * Generic middleware factory — validates req.body against a given Joi schema.
 * Usage: router.post('/register', validate(registerSchema), register)
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // collect all errors, not just the first
    stripUnknown: true, // drop fields not defined in the schema
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return res.status(400).json({ message: 'Validation failed', errors: messages });
  }

  req.body = value; // sanitized/typed value
  next();
};

module.exports = validate;