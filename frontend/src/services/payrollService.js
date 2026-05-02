import api from './api';

const payrollService = {
  // Payroll Officer/Admin: run payroll for a specific month+year
  runPayroll: async (month, year) => {
    const response = await api.post('/payroll/run', { month: parseInt(month), year: parseInt(year) });
    return response.data.data;
  },

  // Get all payroll runs (Admin/Payroll)
  getAllPayroll: async () => {
    const response = await api.get('/payroll');
    return response.data.data.payroll;
  },

  // Get payslips for a specific employee (Issues #12, #16)
  getPayslips: async (employeeId) => {
    const response = await api.get(`/payslip/${employeeId}`);
    return response.data.data.payslips;
  },

  // Get analytics/payroll stats for Payroll Officer dashboard
  getPayrollStats: async () => {
    const response = await api.get('/analytics/payroll');
    return response.data.data;
  },

  // Get admin/HR dashboard stats
  getAdminStats: async () => {
    const response = await api.get('/analytics/summary');
    return response.data.data;
  },
};

export default payrollService;
