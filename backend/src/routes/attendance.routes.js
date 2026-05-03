/**
 * src/routes/attendance.routes.js — v2
 * Added: POST /checkout
 */

import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { markAttendanceSchema } from "../validators/attendance.validators.js";

const router = Router();
router.use(authenticateUser);

// Check-In
router.post("/checkin", authorizeRoles("EMPLOYEE"), validate(markAttendanceSchema), attendanceController.markAttendance);
// Keep old /mark route as alias for backward compatibility
router.post("/mark", authorizeRoles("EMPLOYEE"), validate(markAttendanceSchema), attendanceController.markAttendance);

// Check-Out toggle (Issue #5)
router.post("/checkout", authorizeRoles("EMPLOYEE"), attendanceController.checkOut);

router.get("/my", authorizeRoles("EMPLOYEE"), attendanceController.getMyAttendance);
router.get("/all", authorizeRoles("ADMIN", "HR", "PAYROLL"), attendanceController.getAllAttendance);

export default router;
