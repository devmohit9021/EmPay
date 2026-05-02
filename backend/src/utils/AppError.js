/**
 * src/utils/AppError.js
 * Custom error class for operational (expected) errors.
 * Using this class lets the error middleware distinguish between
 * programmer errors (bugs) and user-facing errors (e.g. not found, forbidden).
 */

export class AppError extends Error {
  /**
   * @param {string} message  - Human-readable error message
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, etc.)
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Flag to identify known errors

    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}
