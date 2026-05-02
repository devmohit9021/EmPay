import api from './api';

const attendanceService = {
  // Mark attendance — backend expects: { status, date?, checkInTime? }
  // status: 'PRESENT' | 'ABSENT'
  markAttendance: async () => {
    const now = new Date();
    const checkInTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format
    const response = await api.post('/attendance/mark', {
      status: 'PRESENT',
      checkInTime,
    });
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
