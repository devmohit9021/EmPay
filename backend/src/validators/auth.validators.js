/**
 * src/validators/auth.validators.js
 * Zod schemas for authentication endpoints.
 */

import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
  role: z
    .enum(["ADMIN", "EMPLOYEE", "HR", "PAYROLL"], {
      errorMap: () => ({
        message: "Role must be one of: ADMIN, EMPLOYEE, HR, PAYROLL",
      }),
    })
    .optional()
    .default("EMPLOYEE"),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase(),
  password: z.string({ required_error: "Password is required" }).min(1),
});
