/**
 * src/routes/analytics.routes.js — NEW
 */

import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticateUser);

// Admin/HR dashboard summary
router.get("/summary", authorizeRoles("ADMIN", "HR"), analyticsController.getAdminStats);

// Payroll dashboard stats
router.get("/payroll", authorizeRoles("ADMIN", "PAYROLL"), analyticsController.getPayrollStats);

export default router;
