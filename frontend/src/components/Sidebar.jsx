import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Clock, 
  CreditCard, 
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', roles: ['ADMIN', 'EMPLOYEE', 'HR', 'PAYROLL'] },
    { name: 'Employees', icon: <Users size={20} />, path: '/employees', roles: ['ADMIN', 'HR', 'PAYROLL'] },
    { name: 'Attendance', icon: <CalendarCheck size={20} />, path: '/attendance', roles: ['ADMIN', 'EMPLOYEE', 'HR', 'PAYROLL'] },
    { name: 'Time Off', icon: <Clock size={20} />, path: '/leaves', roles: ['ADMIN', 'EMPLOYEE', 'HR', 'PAYROLL'] },
    { name: 'Payroll', icon: <CreditCard size={20} />, path: '/payroll', roles: ['ADMIN', 'EMPLOYEE', 'PAYROLL'] },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings', roles: ['ADMIN'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex flex-col h-screen w-64 bg-surface bg-opacity-50 backdrop-blur-xl border-r border-surface-border">
      <div className="flex items-center justify-center h-20 border-b border-surface-border">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-xl">E</div>
          <span className="text-xl font-bold tracking-wider text-white">EmPay</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            {item.icon}
            <span className="flex-1 font-medium">{item.name}</span>
            <ChevronRight size={14} className="opacity-50" />
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-surface-hover mb-4">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-bold text-white">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-500 hover:bg-opacity-10 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
