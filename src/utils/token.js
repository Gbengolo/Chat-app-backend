const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a given user ID.
 * Payload stays minimal — just enough to identify the user.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify a JWT. Throws if invalid/expired — caller handles the error.
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };