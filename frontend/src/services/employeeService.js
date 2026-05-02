import api from './api';

const employeeService = {
  getAllEmployees: async () => {
    const response = await api.get('/employees');
    return response.data.data.employees;
  },

  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data.data.employee;
  },

  getMyProfile: async () => {
    const response = await api.get('/employees/me');
    return response.data.data.employee;
  },

  createEmployee: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data.data.employee;
  },

  updateEmployee: async (id, updateData) => {
    const response = await api.patch(`/employees/${id}`, updateData);
    return response.data.data.employee;
  },

  // Note: Register is in auth routes but handled by admin
  registerEmployee: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

export default employeeService;
