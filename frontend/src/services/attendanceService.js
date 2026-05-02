import api from './api';

const attendanceService = {
  // Check-In: marks PRESENT with current time
  markAttendance: async () => {
    const now = new Date();
    const checkInTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const response = await api.post('/attendance/checkin', {
      status: 'PRESENT',
      checkInTime,
    });
    return response.data.data.attendance;
  },

  // Check-Out: records departure time (Issue #5 toggle)
  checkOut: async () => {
    const response = await api.post('/attendance/checkout');
    return response.data.data.attendance;
  },

  getMyAttendance: async () => {
    const response = await api.get('/attendance/my');
    return response.data.data.attendance;
  },

  getAllAttendance: async (month, year) => {
    let url = '/attendance/all';
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await api.get(url);
    return response.data.data.attendance;
  }
};

export default attendanceService;
