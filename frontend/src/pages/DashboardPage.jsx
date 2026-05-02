import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp,
  UserCheck,
  UserX
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import employeeService from '../services/employeeService';
import attendanceService from '../services/attendanceService';
import leaveService from '../services/leaveService';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaves: 0
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = ['ADMIN', 'HR', 'PAYROLL'].includes(user?.role);

  useEffect(() => {
    if (isAdmin) fetchAdminStats();
    else fetchEmployeeStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const [emps, attendance, leaves] = await Promise.all([
        employeeService.getAllEmployees(),
        attendanceService.getAllAttendance(),
        leaveService.getAllLeaves()
      ]);
      
      const today = new Date().toISOString().split('T')[0];
      const present = (attendance || []).filter(a => a.date === today).length;
      
      setStats({
        totalEmployees: emps.length,
        presentToday: present,
        absentToday: emps.length - present,
        pendingLeaves: (leaves || []).filter(l => l.status === 'PENDING').length
      });
    } catch (error) {
      console.error('Admin stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeStats = async () => {
    try {
      const [profile, attendance, leaves] = await Promise.all([
        employeeService.getMyProfile().catch(() => null),
        attendanceService.getMyAttendance().catch(() => []),
        leaveService.getMyLeaves().catch(() => [])
      ]);

      if (profile) {
        setStats({
          totalEmployees: 1, // Just themselves
          presentToday: (attendance || []).some(a => a.date === new Date().toISOString().split('T')[0]) ? 1 : 0,
          absentToday: 0,
          pendingLeaves: (leaves || []).filter(l => l.status === 'PENDING').length
        });
      }
    } catch (error) {
      console.error('Employee stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const data = [
    { name: 'Mon', attendance: 40, payout: 2400 },
    { name: 'Tue', attendance: 30, payout: 1398 },
    { name: 'Wed', attendance: 20, payout: 9800 },
    { name: 'Thu', attendance: 27, payout: 3908 },
    { name: 'Fri', attendance: 18, payout: 4800 },
    { name: 'Sat', attendance: 23, payout: 3800 },
    { name: 'Sun', attendance: 34, payout: 4300 },
  ];

  const StatCard = ({ title, value, icon, trend, color }) => (
    <div className="glass-card p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-opacity-10 ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      </div>
    </div>
  );

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Hello, {user?.email?.split('@')[0]}! 👋</h2>
          <p className="text-gray-400">Here's what's happening at EmPay today.</p>
        </div>
        <div className="flex items-center space-x-3 bg-surface-input p-1 rounded-xl border border-surface-border">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'analytics' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white'}`}
          >
            Analytics
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Grid Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Employees" 
              value={stats.totalEmployees} 
              icon={<Users className="text-primary" />} 
              trend={12} 
              color="bg-primary" 
            />
            <StatCard 
              title="Present Today" 
              value={stats.presentToday} 
              icon={<UserCheck className="text-green-500" />} 
              trend={5} 
              color="bg-green-500" 
            />
            <StatCard 
              title="On Leave" 
              value={stats.absentToday} 
              icon={<UserX className="text-red-500" />} 
              trend={-2} 
              color="bg-red-500" 
            />
            <StatCard 
              title="Pending Requests" 
              value={stats.pendingLeaves} 
              icon={<Clock className="text-blue-400" />} 
              trend={24} 
              color="bg-blue-400" 
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="text-primary" size={20} />
                  <span>Attendance Trends</span>
                </h3>
              </div>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <AreaChart data={data || []}>
                    <defs>
                      <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9d4edd" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#9d4edd" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#16213e', border: '1px solid #2d2d4e', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="attendance" stroke="#9d4edd" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <CreditCard className="text-primary" size={20} />
                  <span>Payout Distribution</span>
                </h3>
              </div>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <BarChart data={data || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#16213e', border: '1px solid #2d2d4e', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="payout" fill="#9d4edd" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activities Section */}
          <div className="glass-card p-8">
            <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-surface-border pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-surface-input flex items-center justify-center text-primary">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">System Update</p>
                      <p className="text-xs text-gray-400">Everything is up to date.</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Now</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-6">Detailed Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-surface-input rounded-xl border border-surface-border">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Avg. Performance</p>
                <h4 className="text-2xl font-bold text-white">94%</h4>
                <div className="w-full bg-gray-700 h-2 rounded-full mt-4">
                  <div className="bg-primary h-full rounded-full w-[94%]"></div>
                </div>
              </div>
              <div className="p-6 bg-surface-input rounded-xl border border-surface-border">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Retention Rate</p>
                <h4 className="text-2xl font-bold text-white">98.2%</h4>
                <div className="w-full bg-gray-700 h-2 rounded-full mt-4">
                  <div className="bg-green-500 h-full rounded-full w-[98%]"></div>
                </div>
              </div>
              <div className="p-6 bg-surface-input rounded-xl border border-surface-border">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Satisfaction Score</p>
                <h4 className="text-2xl font-bold text-white">4.8/5.0</h4>
                <div className="w-full bg-gray-700 h-2 rounded-full mt-4">
                  <div className="bg-blue-500 h-full rounded-full w-[80%]"></div>
                </div>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4e" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#16213e', border: '1px solid #2d2d4e' }}
                  />
                  <Area type="monotone" dataKey="payout" stroke="#9d4edd" fill="#9d4edd" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="attendance" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
