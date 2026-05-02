import api from './api';

const leaveService = {
  // Apply for leave — now supports multipart/form-data for document upload (Issue #2)
  applyLeave: async (leaveData, documentFile) => {
    const formData = new FormData();
    formData.append('startDate', leaveData.startDate);
    formData.append('endDate', leaveData.endDate);
    formData.append('reason', leaveData.reason);
    if (leaveData.targetEmployeeId) {
      formData.append('targetEmployeeId', leaveData.targetEmployeeId);
    }
    if (documentFile) {
      formData.append('document', documentFile);
    }

    const response = await api.post('/leave/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.leave;
  },

  getMyLeaves: async () => {
    const response = await api.get('/leave/my');
    return response.data.data.leaves;
  },

  getAllLeaves: async () => {
    const response = await api.get('/leave/all');
    return response.data.data.leaves;
  },

  approveLeave: async (id) => {
    const response = await api.patch(`/leave/${id}/approve`);
    return response.data.data.leave;
  },

  rejectLeave: async (id) => {
    const response = await api.patch(`/leave/${id}/reject`);
    return response.data.data.leave;
  },

  // HR: allocate leave days to an employee (Issue #11)
  allocateLeaves: async ({ employeeId, year, daysToGrant }) => {
    const response = await api.post('/leave/allocate', { employeeId, year, daysToGrant });
    return response.data.data.balance;
  },

  // Get leave balance for an employee (Issue #7)
  getLeaveBalance: async (employeeId) => {
    const response = await api.get(`/leave/balance/${employeeId}`);
    return response.data.data.balance;
  },
};

export default leaveService;
