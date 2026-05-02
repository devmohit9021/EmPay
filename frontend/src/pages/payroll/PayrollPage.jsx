import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  FileText,
  Play,
  Download,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react';
import payrollService from '../../services/payrollService';
import employeeService from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PayrollPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [myPayslips, setMyPayslips] = useState([]);
  const [stats, setStats] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Issues #12, #13, #14: PAYROLL Officer and ADMIN can run payroll; EMPLOYEE sees own only
  const isAdmin = ['ADMIN', 'PAYROLL'].includes(user?.role);

  const fetchedRef = React.useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchData();
      fetchedRef.current = true;
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [records, payrollStats] = await Promise.allSettled([
          payrollService.getAllPayroll(),
          payrollService.getPayrollStats(),
        ]);
        setPayrollRecords(records.status === 'fulfilled' ? (records.value || []) : []);
        setStats(payrollStats.status === 'fulfilled' ? payrollStats.value : null);
      } else {
        // Issue #16: Employee sees ONLY their own payroll
        const profile = await employeeService.getMyProfile().catch(() => null);
        setMyProfile(profile);
        if (profile?.id) {
          const slips = await payrollService.getPayslips(profile.id).catch(() => []);
          setMyPayslips(Array.isArray(slips) ? slips : []);
        }
      }
    } catch (error) {
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
      const result = await payrollService.runPayroll(selectedMonth, selectedYear);
      const { processed, skipped, errors } = result.results || result.summary || {};
      toast.success(`Payroll complete! Processed: ${result.summary?.processed ?? '—'}, Skipped: ${result.summary?.skipped ?? 0}`);
      fetchedRef.current = false;
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to run payroll');
    } finally {
      setRunLoading(false);
    }
  };

  const fmt = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary bg-opacity-20 rounded-xl text-primary">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isAdmin ? 'Payroll Management' : 'My Payslips'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isAdmin ? 'Run payroll and view payroll records' : 'View your salary statements'}
            </p>
          </div>
        </div>

        {/* Run Payroll — PAYROLL Officer + ADMIN only (Issue #12) */}
        {isAdmin && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-surface-input border border-surface-border rounded-lg px-3 py-2 space-x-2">
              <Calendar size={16} className="text-gray-400" />
              <select
                className="bg-transparent text-sm text-white focus:outline-none"
                value={selectedMonth}
                onChange={e => setSelectedMonth(parseInt(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                className="bg-transparent text-sm text-white focus:outline-none"
                value={selectedYear}
                onChange={e => setSelectedYear(parseInt(e.target.value))}
              >
                {[2023, 2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRunPayroll}
              disabled={runLoading}
              className="btn-primary flex items-center space-x-2 px-6 py-2.5"
            >
              {runLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* Stats Cards (Issues #13, #14 — real payroll calculations) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 border-b-4 border-primary">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Employees Paid</p>
            <h3 className="text-2xl font-bold text-white">
              {stats?.totalEmployeesPaid ?? payrollRecords.length}
            </h3>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <Users size={12} className="mr-1" />
              <span>{stats?.latestMonth ? `${MONTHS[stats.latestMonth.month - 1]} ${stats.latestMonth.year}` : 'Last Run'}</span>
            </p>
          </div>
          <div className="glass-card p-6 border-b-4 border-green-500">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Net Salary Disbursed</p>
            <h3 className="text-2xl font-bold text-white">
              {stats ? fmt(stats.totalNetSalaryDisbursed) : fmt(payrollRecords.reduce((s, r) => s + Number(r.netSalary || 0), 0))}
            </h3>
            <p className="text-xs text-gray-500 mt-2">Calculated from actual runs</p>
          </div>
          <div className="glass-card p-6 border-b-4 border-red-500">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Deductions</p>
            <h3 className="text-2xl font-bold text-white">
              {stats ? fmt(stats.totalDeductions) : fmt(payrollRecords.reduce((s, r) => s + Number(r.deductions || 0), 0))}
            </h3>
            <p className="text-xs text-gray-500 mt-2">PF + Professional Tax</p>
          </div>
          <div className="glass-card p-6 border-b-4 border-blue-500">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Status</p>
            <div className="flex items-center space-x-2 mt-1">
              <CheckCircle className="text-green-500" size={20} />
              <span className="text-white font-bold text-lg">
                {payrollRecords.length > 0 ? 'PROCESSED' : 'NO DATA'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{payrollRecords.length} total records</p>
          </div>
        </div>
      )}

      {/* Employee: own salary summary card */}
      {!isAdmin && myProfile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 border-b-4 border-primary">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Base Salary</p>
            <h3 className="text-2xl font-bold text-white">{fmt(myProfile.baseSalary)}</h3>
            <p className="text-xs text-gray-500 mt-2">Monthly CTC</p>
          </div>
          <div className="glass-card p-6 border-b-4 border-green-500">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Payslips</p>
            <h3 className="text-2xl font-bold text-white">{myPayslips.length}</h3>
            <p className="text-xs text-gray-500 mt-2">Generated records</p>
          </div>
          <div className="glass-card p-6 border-b-4 border-blue-500">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Department</p>
            <h3 className="text-xl font-bold text-white">{myProfile.department || '—'}</h3>
            <p className="text-xs text-gray-500 mt-2">{myProfile.designation}</p>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText size={20} className="text-primary" />
            <span>{isAdmin ? 'All Payroll Records' : 'My Payslip History'}</span>
          </h3>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-hover text-gray-400 text-[10px] uppercase tracking-widest">
                  {isAdmin && <th className="px-6 py-4 font-bold">Employee</th>}
                  <th className="px-6 py-4 font-bold">Period</th>
                  <th className="px-6 py-4 font-bold text-right">Base Salary</th>
                  <th className="px-6 py-4 font-bold text-right">Days Present</th>
                  <th className="px-6 py-4 font-bold text-right">Deductions</th>
                  <th className="px-6 py-4 font-bold text-right">Net Salary</th>
                  <th className="px-6 py-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    </td>
                  </tr>
                ) : (isAdmin ? payrollRecords : myPayslips).length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3 text-gray-500">
                        <AlertCircle size={32} className="text-gray-600" />
                        <p className="italic">No payroll records found.</p>
                        {isAdmin && (
                          <p className="text-primary text-sm font-medium">Use "Run Payroll" to generate salary records for the selected month.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  (isAdmin ? payrollRecords : myPayslips).map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-surface-hover transition-all">
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-white">{item.employeeName || '—'}</p>
                            <p className="text-xs text-gray-500">{item.employeeCode} · {item.department}</p>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {MONTHS[(item.month || 1) - 1]} {item.year}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-white">
                        {fmt(item.baseSalary)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-300">
                        {item.daysPresent ?? '—'} days
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-red-400">
                        -{fmt(item.deductions)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-green-400">
                        {fmt(item.netSalary)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => navigate(`/payroll/payslip/${item.employeeId || myProfile?.id}`)}
                          className="p-1.5 rounded-lg bg-surface-input border border-surface-border text-gray-400 hover:text-white hover:border-primary transition-all"
                          title="View Payslip"
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
