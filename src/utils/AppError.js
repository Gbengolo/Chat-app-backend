/**
 * Custom error class that carries an HTTP status code.
 * Lets services throw meaningful errors without knowing about Express req/res.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

module.exports = AppError;