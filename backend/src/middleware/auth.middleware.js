/**
 * src/middleware/auth.middleware.js
 * Authentication & Authorization middleware.
 *
 * authenticateUser  — Verifies JWT, attaches decoded user to req.user
 * authorizeRoles    — Factory function that returns a middleware checking
 *                     whether req.user.role is in the allowed roles list.
 */

import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

/**
 * Verifies the Bearer JWT in the Authorization header.
 * Attaches the decoded payload to req.user.
 */
export const authenticateUser = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication token is missing", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token has expired. Please log in again.", 401));
    }
    return next(new AppError("Invalid token. Authentication failed.", 401));
  }
};

/**
 * Role-based authorization factory.
 * Usage: authorizeRoles("ADMIN", "HR")
 *
 * @param  {...string} roles - Allowed roles
 * @returns Express middleware
 */
export const authorizeRoles = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};
