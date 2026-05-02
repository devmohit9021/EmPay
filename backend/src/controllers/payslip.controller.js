/**
 * src/controllers/payslip.controller.js
 * HTTP handler for payslip retrieval.
 */

import * as payslipService from "../services/payslip.service.js";

export const getPayslipsForEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const payslips = await payslipService.getPayslipsForEmployee(
      req.user.id,
      req.user.role,
      employeeId
    );

    res.status(200).json({
      success: true,
      count: payslips.length,
      data: { payslips },
    });
  } catch (err) {
    next(err);
  }
};
