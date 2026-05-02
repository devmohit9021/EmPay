/**
 * src/validators/employee.validators.js — v2
 * Added: companyId, joinedAt, managerId, bank fields
 */

import { z } from "zod";

export const createEmployeeSchema = z.object({
  userId: z.string({ required_error: "userId is required" }).uuid("userId must be a valid UUID"),
  companyId: z.string({ required_error: "companyId is required" }).uuid("companyId must be a valid UUID"),
  department: z.string({ required_error: "Department is required" }).min(2).max(100),
  designation: z.string({ required_error: "Designation is required" }).min(2).max(100),
  baseSalary: z.number({ required_error: "Base salary is required", invalid_type_error: "Must be a number" }).positive(),
  joinedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "joinedAt must be YYYY-MM-DD").optional(),
  managerId: z.string().uuid("managerId must be a valid UUID").optional().nullable(),
});

export const updateEmployeeSchema = z.object({
  department: z.string().min(2).max(100).optional(),
  designation: z.string().min(2).max(100).optional(),
  baseSalary: z.number().positive().optional(),
  managerId: z.string().uuid().nullable().optional(),
  profilePhoto: z.string().url().optional().nullable(),
  bankAccountNo: z.string().max(50).optional().nullable(),
  bankName: z.string().max(100).optional().nullable(),
  ifscCode: z.string().max(20).optional().nullable(),
}).refine((data) => Object.keys(data).length > 0, { message: "At least one field must be provided" });
