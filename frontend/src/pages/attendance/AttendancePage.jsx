import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AttendancePage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [markedToday, setMarkedToday] = useState(false);
  const isAdmin = ['ADMIN', 'HR', 'PAYROLL'].includes(user?.role);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = isAdmin
        ? await attendanceService.getAllAttendance()
        : await attendanceService.getMyAttendance();

      setLogs(Array.isArray(data) ? data : []);

      // Check if employee already marked attendance today
      if (!isAdmin && Array.isArray(data)) {
        const today = new Date().toISOString().split('T')[0];
        const todayLog = data.find(log => log.date?.startsWith(today));
        setMarkedToday(!!todayLog);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch attendance';
      // Silently handle if no employee profile yet
      if (!msg.includes('employee profile')) {
        toast.error(msg);
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    setActionLoading(true);
    try {
      await attendanceService.markAttendance();
      toast.success('Attendance marked successfully!');
      setMarkedToday(true);
      fetchLogs();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to mark attendance';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Attendance Control for Employees */}
      {!isAdmin && (
        <div className="glass-card p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className={`h-20 w-20 rounded-2xl flex items-center justify-center ${markedToday ? 'bg-green-500 bg-opacity-20 text-green-500' : 'bg-primary bg-opacity-20 text-primary'} border border-opacity-30 border-current shadow-lg`}>
                <Clock size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {markedToday ? '✅ Attendance Marked!' : 'Mark Your Attendance'}
                </h2>
                <p className="text-gray-400">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {markedToday && (
                  <p className="text-green-500 text-sm font-medium mt-1">You have already clocked in today.</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleMarkAttendance}
                disabled={actionLoading || markedToday}
                className={`flex items-center space-x-3 px-12 py-4 rounded-lg font-bold text-lg transition-all ${
                  markedToday
                    ? 'bg-green-500 bg-opacity-20 text-green-500 cursor-not-allowed border border-green-500 border-opacity-30'
                    : 'btn-primary shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transform'
                }`}
              >
                {actionLoading ? (
                  <div className="h-6 w-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle size={24} />
                    <span>{markedToday ? 'Marked Present' : 'Mark Present'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Calendar size={22} className="text-primary" />
            <span>{isAdmin ? 'Organization Attendance' : 'Your Attendance History'}</span>
          </h3>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input type="text" placeholder="Search logs..." className="bg-surface-input border border-surface-border rounded-lg pl-9 pr-4 py-2 text-sm w-48 focus:border-primary focus:outline-none" />
            </div>
            <button className="p-2 rounded-lg bg-surface-input border border-surface-border hover:bg-surface-hover text-gray-400 transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-hover text-gray-400 text-xs uppercase tracking-wider">
                  {isAdmin && <th className="px-6 py-4 font-semibold">Employee</th>}
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Check-In Time</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3 text-gray-500">
                        <AlertCircle size={32} className="text-gray-600" />
                        <p className="italic">No attendance records found.</p>
                        {!isAdmin && !markedToday && (
                          <p className="text-primary text-sm font-medium">Click "Mark Present" to record today's attendance!</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-hover transition-colors">
                      {isAdmin && (
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {log.employee?.user?.email?.split('@')[0] || '—'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {log.date ? new Date(log.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-green-400 font-mono font-medium">
                          {log.checkInTime || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`h-2 w-2 rounded-full ${log.status === 'PRESENT' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={log.status === 'PRESENT' ? 'text-green-500' : 'text-red-500'}>
                            {log.status || '—'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-surface-border flex items-center justify-between">
            <span className="text-sm text-gray-400">Showing {logs.length} entries</span>
            <div className="flex items-center space-x-2">
              <button className="p-1 rounded bg-surface-input border border-surface-border text-gray-400 hover:text-white disabled:opacity-50">
                <ChevronLeft size={18} />
              </button>
              <button className="p-1 rounded bg-surface-input border border-surface-border text-gray-400 hover:text-white disabled:opacity-50">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
