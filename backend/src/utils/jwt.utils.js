/**
 * src/utils/jwt.utils.js
 * JWT utility functions for signing and verifying tokens.
 */

import jwt from "jsonwebtoken";

/**
 * Signs a JWT token with the user's id, email, and role.
 * @param {{ id: string, email: string, role: string }} payload
 * @returns {string} Signed JWT token
 */
export const signToken = ({ id, email, role }) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};
