/**
 * src/controllers/attendance.controller.js — v2
 */

import * as attendanceService from "../services/attendance.service.js";

export const markAttendance = async (req, res, next) => {
  try {
    const record = await attendanceService.markAttendance(req.user.id, req.body);
    res.status(201).json({ success: true, message: "Checked in successfully", data: { attendance: record } });
  } catch (err) { next(err); }
};

export const checkOut = async (req, res, next) => {
  try {
    const record = await attendanceService.checkOut(req.user.id);
    res.status(200).json({ success: true, message: "Checked out successfully", data: { attendance: record } });
  } catch (err) { next(err); }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const filter = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50
    };
    const records = await attendanceService.getMyAttendance(req.user.id, filter);
    res.status(200).json({ success: true, count: records.length, data: { attendance: records } });
  } catch (err) { next(err); }
};

export const getAllAttendance = async (req, res, next) => {
  try {
    const { month, year, page, limit } = req.query;
    const filter = {
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50
    };
    const records = await attendanceService.getAllAttendance(filter);
    res.status(200).json({ success: true, count: records.length, data: { attendance: records } });
  } catch (err) { next(err); }
};
