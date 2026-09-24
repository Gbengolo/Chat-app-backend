const authService = require('../services/authService');

/**
 * @route   POST /api/auth/register
 * @access  Public
 * req.body already validated + sanitized by the `validate` middleware upstream.
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully', ...result });
  } catch (err) {
    // AppError carries a statusCode; fall back to 500 for anything unexpected
    if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
    next(err); // let a global error handler deal with unexpected errors, if one exists
  }
};

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({ message: 'Login successful', ...result });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
    next(err);
  }
};

/**
 * @route   GET /api/auth/me
 * @access  Private (requires the `protect` middleware)
 */
const getMe = async (req, res) => {
  // req.user is attached by the protect middleware
  res.status(200).json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    },
  });
};

module.exports = { register, login, getMe };