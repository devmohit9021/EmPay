/**
 * src/validators/payroll.validators.js
 * Zod schema for triggering a payroll run.
 */

import { z } from "zod";

const currentYear = new Date().getFullYear();

export const payrollRunSchema = z.object({
  month: z
    .number({ required_error: "Month is required", invalid_type_error: "Month must be a number" })
    .int("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  year: z
    .number({ required_error: "Year is required", invalid_type_error: "Year must be a number" })
    .int("Year must be an integer")
    .min(2020, "Year must be 2020 or later")
    .max(2099, "Year must be valid"),
  // Optional: target specific employees; if omitted, runs for all active employees
  employeeIds: z
    .array(z.string().uuid("Each employeeId must be a valid UUID"))
    .optional(),
  // Optional override for total working days this month
  totalWorkingDays: z
    .number()
    .int()
    .min(1)
    .max(31)
    .optional(),
});
