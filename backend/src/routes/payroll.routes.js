/**
 * src/routes/payroll.routes.js — v2
 * Added: GET /payroll (all records for Admin/Payroll dashboard)
 */

import { Router } from "express";
import * as payrollController from "../controllers/payroll.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { payrollRunSchema } from "../validators/payroll.validators.js";

const router = Router();
router.use(authenticateUser);

router.get("/", authorizeRoles("ADMIN", "PAYROLL"), payrollController.getAllPayroll);
router.post("/run", authorizeRoles("ADMIN", "PAYROLL"), validate(payrollRunSchema), payrollController.runPayroll);

export default router;
