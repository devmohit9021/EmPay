import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
  const location = useLocation();
  
  // Mapping paths to titles
  const getTitle = (pathname) => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/employees')) return 'Employee Management';
    if (pathname.startsWith('/attendance')) return 'Attendance Tracking';
    if (pathname.startsWith('/leaves')) return 'Leave Management';
    if (pathname.startsWith('/payroll')) return 'Payroll & Payslips';
    if (pathname.startsWith('/settings')) return 'System Settings';
    return 'EmPay';
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getTitle(location.pathname)} />
        
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
