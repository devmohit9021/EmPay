/**
 * src/validators/employee.validators.js
 * Zod schemas for employee creation and updates.
 */

import { z } from "zod";

export const createEmployeeSchema = z.object({
  // userId links employee profile to a user account
  userId: z
    .string({ required_error: "userId is required" })
    .uuid("userId must be a valid UUID"),
  department: z
    .string({ required_error: "Department is required" })
    .min(2, "Department must be at least 2 characters")
    .max(100),
  designation: z
    .string({ required_error: "Designation is required" })
    .min(2, "Designation must be at least 2 characters")
    .max(100),
  baseSalary: z
    .number({ required_error: "Base salary is required", invalid_type_error: "Base salary must be a number" })
    .positive("Base salary must be positive"),
});

export const updateEmployeeSchema = z.object({
  department: z.string().min(2).max(100).optional(),
  designation: z.string().min(2).max(100).optional(),
  baseSalary: z.number().positive("Base salary must be positive").optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);
