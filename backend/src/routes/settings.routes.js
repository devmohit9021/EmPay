/**
 * src/routes/settings.routes.js — NEW
 * Admin-only settings panel routes.
 */

import { Router } from "express";
import * as settingsController from "../controllers/settings.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createCompanySchema, updateCompanySchema, changeRoleSchema } from "../validators/settings.validators.js";

const router = Router();
router.use(authenticateUser);

// Company management
router.get("/companies", settingsController.getCompanies); // Open to all authenticated users
router.post("/companies", authorizeRoles("ADMIN"), validate(createCompanySchema), settingsController.createCompany);
router.patch("/companies/:id", authorizeRoles("ADMIN"), validate(updateCompanySchema), settingsController.updateCompany);

// User & Role management
router.get("/users", authorizeRoles("ADMIN"), settingsController.listAllUsers);
router.patch("/users/:id/role", authorizeRoles("ADMIN"), validate(changeRoleSchema), settingsController.changeUserRole);

export default router;
