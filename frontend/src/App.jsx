import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EmployeeListPage from './pages/employees/EmployeeListPage';
import EmployeeProfilePage from './pages/employees/EmployeeProfilePage';
import AttendancePage from './pages/attendance/AttendancePage';
import LeavePage from './pages/leaves/LeavePage';
import PayrollPage from './pages/payroll/PayrollPage';
import PayslipPage from './pages/payroll/PayslipPage';

const Settings = () => <div className="glass-card p-6">Settings Page (Coming Soon)</div>;
const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <h1 className="text-4xl font-bold text-red-500 mb-4">403 - Unauthorized</h1>
    <p className="text-gray-400">You do not have permission to access this page.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#16213e',
              color: '#fff',
              border: '1px solid #2d2d4e'
            }
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/leaves" element={<LeavePage />} />
              <Route path="/payroll" element={<PayrollPage />} />
              <Route path="/payroll/payslip/:employeeId" element={<PayslipPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* HR / Admin / Payroll Access */}
              <Route element={<RoleRoute allowedRoles={['ADMIN', 'HR', 'PAYROLL']} />}>
                <Route path="/employees" element={<EmployeeListPage />} />
                <Route path="/employees/:id" element={<EmployeeProfilePage />} />
              </Route>
              
              {/* Admin Only */}
              <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                <Route path="/employees/new" element={<RegisterPage />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
