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

  getMyAttendance: async (page = 1, limit = 50) => {
    const response = await api.get(`/attendance/my?page=${page}&limit=${limit}`);
    return response.data.data.attendance;
  },

  getAllAttendance: async (month, year, page = 1, limit = 50) => {
    let url = `/attendance/all?page=${page}&limit=${limit}`;
    if (month) url += `&month=${month}`;
    if (year) url += `&year=${year}`;

    const response = await api.get(url);
    return response.data.data.attendance;
  }
};

export default attendanceService;
