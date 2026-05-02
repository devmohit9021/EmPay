import api from './api';

const payrollService = {
  runPayroll: async (month, year) => {
    const response = await api.post('/payroll/run', { month, year });
    return response.data.data;
  },

  getPayslips: async (employeeId) => {
    const response = await api.get(`/payslip/${employeeId}`);
    return response.data.data.payslips;
  }
};

export default payrollService;
