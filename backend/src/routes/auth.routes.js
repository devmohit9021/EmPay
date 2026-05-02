/**
 * src/routes/auth.routes.js
 * Auth module routes.
 *
 * POST /auth/register  — Public
 * POST /auth/login     — Public
 * GET  /auth/me        — Authenticated
 */

import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validators.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticateUser, authController.getMe);

export default router;
