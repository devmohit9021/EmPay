/**
 * src/routes/auth.routes.js — v3
 *
 * POST /auth/setup        — One-time company + admin setup (public, only if no companies)
 * GET  /auth/check-setup  — Check if system is already set up (public)
 * POST /auth/register     — Create EMPLOYEE account (Admin uses this to add users)
 * POST /auth/login        — Login
 * GET  /auth/me           — Get own user data
 * PATCH /auth/profile     — Update own name
 */

import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema, setupSchema } from "../validators/auth.validators.js";
import { changeRoleSchema } from "../validators/settings.validators.js";
import { z } from "zod";

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
});

// ── Public ───────────────────────────────────────────────────────────────────
router.get("/check-setup", authController.checkSetup);
router.post("/setup", validate(setupSchema), authController.setupCompany);
router.post("/login", validate(loginSchema), authController.login);

// Register is now ADMIN-only to add new users (they always get EMPLOYEE role first)
router.post(
  "/register",
  authenticateUser,
  authorizeRoles("ADMIN", "HR"),
  validate(registerSchema),
  authController.register
);

// ── Authenticated ─────────────────────────────────────────────────────────────
router.get("/me", authenticateUser, authController.getMe);
router.patch("/profile", authenticateUser, validate(updateProfileSchema), authController.updateProfile);

// Admin: manage all users
router.get("/users", authenticateUser, authorizeRoles("ADMIN"), authController.getAllUsers);
router.patch("/users/:id/role", authenticateUser, authorizeRoles("ADMIN"), validate(changeRoleSchema), authController.updateUserRole);

export default router;
