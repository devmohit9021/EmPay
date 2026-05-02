import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  Play, 
  Download, 
  Filter,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import payrollService from '../../services/payrollService';
import employeeService from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PayrollPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const isAdmin = ['ADMIN', 'PAYROLL'].includes(user?.role);

  const fetchedRef = React.useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchData();
      fetchedRef.current = true;
    }
  }, []);

  const fetchData = async () => {
    try {
      if (isAdmin) {
        // Admins see a summary of employees and their payroll status
        const empData = await employeeService.getAllEmployees();
        setEmployees(empData);
      } else {
        // Employees see their own payslips
        // First get the employee profile to get the correct ID
        const profile = await employeeService.getMyProfile();
        if (profile) {
          const data = await payrollService.getPayslips(profile.id);
          setPayslips(data || []);
        }
      }
    } catch (error) {
      console.error('Payroll fetch error:', error);
      // Only show error if it's not a 404 (which might mean no profile yet)
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch payroll data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async () => {
    setRunLoading(true);
    try {
      await payrollService.runPayroll(selectedMonth, selectedYear);
      toast.success('Payroll run completed successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to run payroll');
    } finally {
      setRunLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary bg-opacity-20 rounded-xl text-primary">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Payroll Management</h2>
            <p className="text-gray-400 text-sm">Manage employee compensation and payslips</p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-surface-input border border-surface-border rounded-lg px-3 py-2">
              <Calendar size={18} className="text-gray-400 mr-2" />
              <select 
                className="bg-transparent text-sm text-white focus:outline-none"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleRunPayroll}
              disabled={runLoading}
              className="btn-primary flex items-center space-x-2 px-6 py-2.5"
            >
              {runLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Play size={18} />
                  <span>Run Payroll</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-b-4 border-primary">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Payout</p>
          <h3 className="text-2xl font-bold text-white">₹1,240,500</h3>
          <p className="text-xs text-green-500 mt-2 flex items-center">
            <AlertCircle size={12} className="mr-1" />
            <span>Monthly budget</span>
          </p>
        </div>
        <div className="glass-card p-6 border-b-4 border-green-500">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Deductions</p>
          <h3 className="text-2xl font-bold text-white">₹145,200</h3>
          <p className="text-xs text-gray-400 mt-2">Tax, PF, Insurance</p>
        </div>
        <div className="glass-card p-6 border-b-4 border-blue-500">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Net Payable</p>
          <h3 className="text-2xl font-bold text-white">₹1,095,300</h3>
          <p className="text-xs text-gray-400 mt-2">All employees</p>
        </div>
        <div className="glass-card p-6 border-b-4 border-primary-light">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center space-x-2 mt-1">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-white font-bold text-lg">PROCESSED</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Oct 2024</p>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText size={20} className="text-primary" />
            <span>{isAdmin ? 'Employee Payslips' : 'My Payslips'}</span>
          </h3>
          <button className="text-sm text-primary font-semibold hover:underline flex items-center space-x-1">
            <Download size={16} />
            <span>Export All</span>
          </button>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-hover text-gray-400 text-[10px] uppercase tracking-widest">
                  {isAdmin && <th className="px-6 py-4 font-bold">Employee</th>}
                  <th className="px-6 py-4 font-bold">Period</th>
                  <th className="px-6 py-4 font-bold text-right">Gross Earnings</th>
                  <th className="px-6 py-4 font-bold text-right">Deductions</th>
                  <th className="px-6 py-4 font-bold text-right">Net Salary</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                    </td>
                  </tr>
                ) : (isAdmin ? employees : payslips).length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                      No payslips generated for this period.
                    </td>
                  </tr>
                ) : (
                  (isAdmin ? employees : payslips).map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-hover transition-all">
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-surface-input border border-surface-border flex items-center justify-center text-xs font-bold text-primary">
                              {item.user?.email?.[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-white">{item.user?.email?.split('@')[0]}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-300">Oct 2024</td>
                      <td className="px-6 py-4 text-sm text-right text-white">₹{isAdmin ? item.baseSalary : item.earnings}</td>
                      <td className="px-6 py-4 text-sm text-right text-red-400">-₹{isAdmin ? (item.baseSalary * 0.1).toFixed(0) : item.deductions}</td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-primary-light">₹{isAdmin ? (item.baseSalary * 0.9).toFixed(0) : item.netPayable}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-[9px] font-black tracking-tighter bg-green-500 bg-opacity-10 text-green-500 border border-green-500 border-opacity-30">
                          PAID
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => navigate(`/payroll/payslip/${isAdmin ? item.id : item.id}`)}
                          className="p-1.5 rounded-lg bg-surface-input border border-surface-border text-gray-400 hover:text-white hover:border-primary transition-all"
                        >
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;
