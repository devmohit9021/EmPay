import api from './api';

const payrollService = {
  // Admin/Payroll: preview payroll calculations without committing
  previewPayroll: async (month, year, totalWorkingDays = 26) => {
    const response = await api.get(`/payroll/preview?month=${month}&year=${year}&totalWorkingDays=${totalWorkingDays}`);
    return response.data.data.preview;
  },

  // Admin/Payroll: run payroll for a specific month+year (commits to DB)
  runPayroll: async (month, year, totalWorkingDays = 26) => {
    const response = await api.post('/payroll/run', {
      month: parseInt(month),
      year: parseInt(year),
      totalWorkingDays: parseInt(totalWorkingDays),
    });
    return response.data.data;
  },

  // Get all payroll runs (Admin/Payroll)
  getAllPayroll: async () => {
    const response = await api.get('/payroll');
    return response.data.data.payroll;
  },

  // Employee: get own payslip history
  getMyPayroll: async () => {
    const response = await api.get('/payroll/my');
    return response.data.data.payroll;
  },

  // Get payslip history for a specific employee
  getPayslipsByEmployee: async (employeeId) => {
    const response = await api.get(`/payroll/employee/${employeeId}`);
    return response.data.data.payroll;
  },

  // Legacy: get payslips via payslip route (used by PayslipPage)
  getPayslips: async (employeeId) => {
    const response = await api.get(`/payslip/${employeeId}`);
    return response.data.data.payslips;
  },

  // Analytics
  getPayrollStats: async () => {
    const response = await api.get('/analytics/payroll');
    return response.data.data;
  },

  getAdminStats: async () => {
    const response = await api.get('/analytics/summary');
    return response.data.data;
  },
};

export default payrollService;
