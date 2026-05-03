import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
    <div className="h-screen bg-bg flex flex-col overflow-hidden">
      <Header title={getTitle(location.pathname)} />
      
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative z-0">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
