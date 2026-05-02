/**
 * src/controllers/attendance.controller.js
 * HTTP handlers for attendance endpoints.
 */

import * as attendanceService from "../services/attendance.service.js";

export const markAttendance = async (req, res, next) => {
  try {
    // req.user.id comes from the JWT (set by authenticateUser middleware)
    const record = await attendanceService.markAttendance(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: { attendance: record },
    });
  } catch (err) {
    next(err);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const records = await attendanceService.getMyAttendance(req.user.id);
    res.status(200).json({
      success: true,
      count: records.length,
      data: { attendance: records },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllAttendance = async (req, res, next) => {
  try {
    // Support optional ?month=5&year=2024 query params
    const { month, year } = req.query;
    const filter = {};
    if (month && year) {
      filter.month = parseInt(month);
      filter.year = parseInt(year);
    }

    const records = await attendanceService.getAllAttendance(filter);
    res.status(200).json({
      success: true,
      count: records.length,
      data: { attendance: records },
    });
  } catch (err) {
    next(err);
  }
};
