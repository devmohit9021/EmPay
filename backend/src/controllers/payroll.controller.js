/**
 * src/controllers/payroll.controller.js
 * HTTP handler for payroll run trigger.
 */

import * as payrollService from "../services/payroll.service.js";

export const runPayroll = async (req, res, next) => {
  try {
    const result = await payrollService.runPayroll(req.body);
    res.status(200).json({
      success: true,
      message: `Payroll run completed for ${req.body.month}/${req.body.year}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
