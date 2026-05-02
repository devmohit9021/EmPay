/**
 * src/validators/auth.validators.js — v3
 * registerSchema: NO role field (always EMPLOYEE from backend)
 * setupSchema: for the one-time company+admin setup
 */

import { z } from "zod";

// Public registration — no role allowed
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
  // Strip role even if accidentally sent — backend ignores it
});

// One-time company + admin setup
export const setupSchema = z.object({
  companyName: z
    .string({ required_error: "Company name is required" })
    .min(2, "Company name must be at least 2 characters")
    .max(150),
  companyCode: z
    .string({ required_error: "Company code is required" })
    .length(2, "Company code must be exactly 2 characters")
    .toUpperCase(),
  adminName: z
    .string({ required_error: "Admin name is required" })
    .min(2, "Name must be at least 2 characters"),
  adminEmail: z
    .string({ required_error: "Admin email is required" })
    .email("Invalid email format")
    .toLowerCase(),
  adminPassword: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase(),
  password: z.string({ required_error: "Password is required" }).min(1),
});
