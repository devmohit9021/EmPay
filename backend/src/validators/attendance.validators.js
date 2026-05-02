/**
 * src/validators/attendance.validators.js
 * Zod schema for marking attendance.
 */

import { z } from "zod";

export const markAttendanceSchema = z.object({
  // Date is optional — defaults to today on the service layer
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  status: z
    .enum(["PRESENT", "ABSENT"], {
      errorMap: () => ({ message: "Status must be PRESENT or ABSENT" }),
    })
    .optional()
    .default("PRESENT"),
  checkInTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Check-in time must be in HH:MM or HH:MM:SS format")
    .optional(),
});
