/**
 * src/validators/leave.validators.js
 * Zod schema for leave application.
 */

import { z } from "zod";

export const applyLeaveSchema = z
  .object({
    startDate: z
      .string({ required_error: "Start date is required" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
    endDate: z
      .string({ required_error: "End date is required" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
    reason: z
      .string({ required_error: "Reason is required" })
      .min(5, "Reason must be at least 5 characters")
      .max(500),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );
