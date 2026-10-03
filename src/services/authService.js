const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateToken } = require('../utils/token');

/**
 * Registers a new user.
 * Throws AppError(409) if username/email already taken.
 */
const registerUser = async ({ username, email, password }) => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    const field = existingUser.email === email ? 'Email' : 'Username';
    throw new AppError(`${field} is already in use`, 409);
  }

  // Password gets hashed automatically via the pre('save') hook on the User model
  const user = await User.create({ username, email, password });



  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  };
};

/**
 * Authenticates a user by email + password.
 * Throws AppError(401) on any mismatch (vague on purpose — don't reveal which field was wrong).
 */
const loginUser = async ({ email, password }) => {
  // Explicitly select password since the schema excludes it by default
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  };
};

const resetPassword = async ({ email, newPassword }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('No account found with that email', 404);
  }
  user.password = newPassword;
  await user.save();
  return { message: 'Password reset successful' };
};

module.exports = { registerUser, loginUser, resetPassword };