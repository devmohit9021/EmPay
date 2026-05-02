/**
 * src/controllers/payroll.controller.js — v2
 */

import * as payrollService from "../services/payroll.service.js";

export const runPayroll = async (req, res, next) => {
  try {
    const result = await payrollService.runPayroll(req.body);
    res.status(200).json({ success: true, message: "Payroll run complete", data: result });
  } catch (err) { next(err); }
};

export const getAllPayroll = async (req, res, next) => {
  try {
    const data = await payrollService.getAllPayroll();
    res.status(200).json({ success: true, count: data.length, data: { payroll: data } });
  } catch (err) { next(err); }
};
