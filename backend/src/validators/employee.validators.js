/**
 * src/validators/employee.validators.js — v3
 *
 * createEmployeeSchema:
 *  - companyId: optional — auto-resolved server-side from Admin's company
 *  - baseSalary: accepts number OR numeric string (frontend sends both)
 */

import { z } from "zod";

export const createEmployeeSchema = z.object({
  userId: z.string({ required_error: "userId is required" }).uuid("userId must be a valid UUID"),

  // companyId is optional — the controller auto-resolves it from the Admin's profile
  companyId: z.string().uuid("companyId must be a valid UUID").optional(),

  department: z.string({ required_error: "Department is required" }).min(2).max(100),
  designation: z.string({ required_error: "Designation is required" }).min(2).max(100),

  // Accept number or numeric string (parseFloat on frontend sends number, forms may send string)
  baseSalary: z
    .union([
      z.number().positive(),
      z.string().regex(/^\d+(\.\d+)?$/, "baseSalary must be a positive number"),
    ])
    .transform((v) => (typeof v === "string" ? parseFloat(v) : v)),

  joinedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "joinedAt must be YYYY-MM-DD").optional(),
  managerId: z.string().uuid("managerId must be a valid UUID").optional().nullable(),
});

export const updateEmployeeSchema = z.object({
  department: z.string().min(2).max(100).optional(),
  designation: z.string().min(2).max(100).optional(),
  baseSalary: z
    .union([z.number().positive(), z.string().regex(/^\d+(\.\d+)?$/)])
    .transform((v) => (typeof v === "string" ? parseFloat(v) : v))
    .optional(),
  managerId: z.string().uuid().nullable().optional(),
  profilePhoto: z.string().url().optional().nullable(),
  bankAccountNo: z.string().max(50).optional().nullable(),
  bankName: z.string().max(100).optional().nullable(),
  ifscCode: z.string().max(20).optional().nullable(),
  mobile: z.string().max(20).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  about: z.string().optional().nullable(),
  jobLove: z.string().optional().nullable(),
  hobbies: z.string().optional().nullable(),
  skills: z.union([z.array(z.string()), z.array(z.object({ label: z.string(), value: z.string() }).passthrough())]).optional().nullable(),
  certifications: z.union([z.array(z.string()), z.array(z.object({ name: z.string(), year: z.string().optional() }).passthrough())]).optional().nullable(),
}).refine((data) => Object.keys(data).length > 0, { message: "At least one field must be provided" });
