import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
  const location = useLocation();
  
  // Mapping paths to titles
  const getTitle = (pathname) => {
    if (pathname.startsWith('/employees')) return 'Employees';
    if (pathname.startsWith('/attendance')) return 'Attendance Tracking';
    if (pathname.startsWith('/leaves')) return 'Time Off';
    if (pathname.startsWith('/payroll')) return 'Payroll & Payslips';
    if (pathname.startsWith('/settings')) return 'System Settings';
    if (pathname.startsWith('/profile')) return 'My Profile';
    if (pathname.startsWith('/dashboard')) return 'Reports & Overview';
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
