/**
 * src/middleware/error.middleware.js
 * Centralized error handling middleware.
 * Must be the LAST middleware registered in Express.
 *
 * Handles:
 *  - AppError (operational, known errors)
 *  - PostgreSQL unique constraint violations (code 23505)
 *  - Generic unhandled errors
 */

import { AppError } from "../utils/AppError.js";

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  // Log error in development for debugging
  if (process.env.NODE_ENV !== "production") {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    if (!(err instanceof AppError)) console.error(err.stack);
  }

  // Operational errors: known, expected failures (e.g. "User not found")
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // PostgreSQL unique violation (e.g., duplicate email, duplicate attendance)
  if (err.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "A record with this data already exists.",
      detail: err.detail || undefined,
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === "23503") {
    return res.status(400).json({
      success: false,
      message: "Referenced record does not exist.",
    });
  }

  // Fallback: unexpected server error
  return res.status(500).json({
    success: false,
    message: "An internal server error occurred. Please try again later.",
  });
};
