/**
 * src/middleware/validate.middleware.js
 * Zod request validation middleware factory.
 * Validates req.body against a given Zod schema.
 * Returns 422 Unprocessable Entity on validation failure.
 */

import { ZodError } from "zod";

/**
 * @param {import("zod").ZodSchema} schema - Zod schema to validate against
 * @returns Express middleware
 */
export const validate = (schema) => (req, res, next) => {
  try {
    // Parse and replace body with validated/coerced data
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      // Format Zod errors into a clean, readable structure
      const errors = err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }
    next(err);
  }
};
