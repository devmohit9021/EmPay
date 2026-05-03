import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  User, 
  LogOut,
  LayoutDashboard,
  Users,
  CalendarCheck,
  Clock,
  CreditCard,
  Settings,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Employees',   icon: <Users size={18} />,           path: '/employees',  roles: ['ADMIN', 'HR', 'PAYROLL'] },
    { name: 'My Profile',  icon: <UserCircle size={18} />,      path: '/profile',    roles: ['EMPLOYEE'] },
    { name: 'Attendance',  icon: <CalendarCheck size={18} />,   path: '/attendance', roles: ['ADMIN', 'EMPLOYEE', 'HR', 'PAYROLL'] },
    { name: 'Time Off',    icon: <Clock size={18} />,           path: '/leaves',     roles: ['ADMIN', 'EMPLOYEE', 'HR', 'PAYROLL'] },
    { name: 'Payroll',     icon: <CreditCard size={18} />,      path: '/payroll',    roles: ['ADMIN', 'EMPLOYEE', 'PAYROLL'] },
    { name: 'Reports',     icon: <LayoutDashboard size={18} />, path: '/dashboard',  roles: ['ADMIN', 'HR', 'PAYROLL'] },
    { name: 'Settings',    icon: <Settings size={18} />,        path: '/settings',   roles: ['ADMIN'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <header className="bg-surface-card border-b border-surface-border z-50">
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-8">
        {/* Logo & Title */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 mr-4">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-xl cursor-pointer" onClick={() => navigate('/dashboard')}>E</div>
            <span className="text-xl font-bold tracking-wider text-white hidden sm:block cursor-pointer" onClick={() => navigate('/dashboard')}>EmPay</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-300 border-l border-surface-border pl-6 hidden lg:block">{title}</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-surface-input border border-surface-border rounded-full pl-10 pr-4 py-1.5 text-xs w-48 lg:w-64 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <button className="relative p-2 rounded-full hover:bg-surface-hover text-gray-400 hover:text-white transition-all">
            <Bell size={18} />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-primary rounded-full"></span>
          </button>

          <div className="flex items-center space-x-3 border-l border-surface-border pl-4">
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="text-right hidden xl:block">
                <p className="text-xs font-semibold text-white">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-primary font-medium">{user?.role}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-surface-input border border-surface-border flex items-center justify-center overflow-hidden">
                <User size={18} className="text-gray-400" />
              </div>
            </button>
            <button 
              onClick={logout}
              className="p-2 text-red-400 hover:bg-red-500 hover:bg-opacity-10 rounded-full transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar (Below Top Bar) */}
      <div className="h-12 border-t border-surface-border border-opacity-30 px-8 flex items-center overflow-x-auto no-scrollbar">
        <nav className="flex space-x-1">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20' 
                    : 'text-gray-400 hover:text-white hover:bg-surface-hover'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
