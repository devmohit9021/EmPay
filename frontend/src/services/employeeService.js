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

  // Get own employee profile (Issue #15 — employee can view/edit their own profile)
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
  },

  // Settings: get all companies
  getCompanies: async () => {
    const response = await api.get('/settings/companies');
    return response.data.data.companies;
  },

  createCompany: async (data) => {
    const response = await api.post('/settings/companies', data);
    return response.data.data.company;
  },

  // Settings: user management
  getAllUsers: async () => {
    const response = await api.get('/settings/users');
    return response.data.data.users;
  },

  changeUserRole: async (userId, role) => {
    const response = await api.patch(`/settings/users/${userId}/role`, { role });
    return response.data.data.user;
  },
};

export default employeeService;
