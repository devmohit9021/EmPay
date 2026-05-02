/**
 * src/routes/attendance.routes.js
 * Attendance module routes.
 *
 * POST /attendance/mark — EMPLOYEE (marks own attendance)
 * GET  /attendance/my   — EMPLOYEE (own history)
 * GET  /attendance/all  — ADMIN, HR, PAYROLL
 *       ?month=5&year=2024 — optional filter
 */

import { Router } from "express";
import * as attendanceController from "../controllers/attendance.controller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { markAttendanceSchema } from "../validators/attendance.validators.js";

const router = Router();

router.use(authenticateUser);

router.post(
  "/mark",
  authorizeRoles("EMPLOYEE"),
  validate(markAttendanceSchema),
  attendanceController.markAttendance
);

router.get(
  "/my",
  authorizeRoles("EMPLOYEE"),
  attendanceController.getMyAttendance
);

router.get(
  "/all",
  authorizeRoles("ADMIN", "HR", "PAYROLL"),
  attendanceController.getAllAttendance
);

export default router;
