import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="h-20 border-b border-surface-border flex items-center justify-between px-8 bg-bg">
      <h1 className="text-2xl font-bold text-white">{title}</h1>

      <div className="flex items-center space-x-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-surface-input border border-surface-border rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <button className="relative p-2 rounded-full hover:bg-surface-hover text-gray-400 hover:text-white transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full"></span>
        </button>

        <div className="flex items-center space-x-3 border-l border-surface-border pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-primary font-medium">{user?.role}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-surface-input border border-surface-border flex items-center justify-center overflow-hidden">
            <User size={24} className="text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
