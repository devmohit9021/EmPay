import api from './api';

const leaveService = {
  // Backend schema: { startDate, endDate, reason } — no "type" field
  applyLeave: async (leaveData) => {
    const payload = {
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      reason: leaveData.reason,
    };
    const response = await api.post('/leave/apply', payload);
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
  }
};

export default leaveService;
