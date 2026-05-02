/**
 * src/validators/leave.validators.js — v2
 * Added: targetEmployeeId for HR allocation, year/daysToGrant for allocate endpoint
 */

import { z } from "zod";

export const applyLeaveSchema = z
  .object({
    startDate: z.string({ required_error: "Start date is required" }).regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
    endDate: z.string({ required_error: "End date is required" }).regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
    reason: z.string({ required_error: "Reason is required" }).min(5).max(500),
    // HR/Admin can provide targetEmployeeId to apply on behalf
    targetEmployeeId: z.string().uuid().optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const allocateLeaveSchema = z.object({
  employeeId: z.string({ required_error: "employeeId is required" }).uuid(),
  year: z.number({ required_error: "Year is required" }).int().min(2020).max(2100),
  daysToGrant: z.number({ required_error: "daysToGrant is required" }).int().positive(),
});
