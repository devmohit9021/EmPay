import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Play, Eye, Loader2, RefreshCw,
  TrendingUp, Users, DollarSign, CheckCircle2,
  AlertCircle, Calendar, ChevronDown, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import payrollService from '../../services/payrollService';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

/* ─── Payslip Detail Modal ─────────────────────────────────────────────────── */
const PayslipModal = ({ record, companyName, onClose }) => {
  const handlePrint = () => {
    const content = document.getElementById('payslip-print-area').innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Payslip – ${record.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #000; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 20px; }
        .company { font-size: 22px; font-weight: bold; }
        .title   { font-size: 14px; color: #555; margin-top: 4px; }
        table    { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td   { border: 1px solid #ddd; padding: 8px 12px; font-size: 13px; }
        th       { background: #f0f0f0; text-align: left; }
        .net     { font-size: 16px; font-weight: bold; background: #e8f5e9; }
        .section { font-weight: bold; background: #fafafa; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; font-size: 13px; }
        .info-item label { color: #666; display: block; font-size: 11px; }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const period = `${MONTHS[record.month - 1]} ${record.year}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass-card w-full max-w-2xl my-4 relative">
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary bg-opacity-20 rounded-xl flex items-center justify-center text-primary">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Payslip</h3>
              <p className="text-gray-400 text-xs">{period}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-opacity-80 transition-all">
              🖨️ Print
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
          </div>
        </div>

        {/* Payslip content — also used for print */}
        <div id="payslip-print-area" className="p-6 space-y-6">
          {/* Company & period header */}
          <div className="header text-center border-b border-surface-border pb-4">
            <p className="company text-2xl font-black text-white">{companyName || 'EmPay HRMS'}</p>
            <p className="title text-gray-400 text-sm mt-1">Salary Slip — {period}</p>
          </div>

          {/* Employee info grid */}
          <div className="info-grid grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[
              ['Employee Name', record.name],
              ['Employee Code', record.employeeCode || '—'],
              ['Department',    record.department   || '—'],
              ['Designation',   record.designation  || '—'],
              ['Pay Period',    period],
              ['Days Worked',   `${record.daysPresent} / ${record.totalWorkingDays || 26}`],
              ['Paid Leaves',   record.leavesTaken],
              ['Unpaid Leaves', record.unpaidLeaves || 0],
            ].map(([label, value]) => (
              <div key={label}>
                <span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
                <p className="text-white font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {/* Earnings & Deductions table */}
          <table className="w-full text-sm border border-surface-border rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-surface-hover">
                <th className="text-left px-4 py-3 text-gray-300 font-semibold">Earnings</th>
                <th className="text-right px-4 py-3 text-gray-300 font-semibold">Amount</th>
                <th className="text-left px-4 py-3 text-gray-300 font-semibold border-l border-surface-border">Deductions</th>
                <th className="text-right px-4 py-3 text-gray-300 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-surface-border">
                <td className="px-4 py-3 text-gray-300">Basic Salary</td>
                <td className="px-4 py-3 text-right text-green-400 font-mono">{fmt(record.baseSalary)}</td>
                <td className="px-4 py-3 text-gray-300 border-l border-surface-border">Provident Fund (12%)</td>
                <td className="px-4 py-3 text-right text-red-400 font-mono">{fmt(record.pfDeduction)}</td>
              </tr>
              {record.unpaidLeaves > 0 && (
                <tr className="border-t border-surface-border">
                  <td colSpan={2} />
                  <td className="px-4 py-3 text-gray-300 border-l border-surface-border">LWP Deduction ({record.unpaidLeaves} days)</td>
                  <td className="px-4 py-3 text-right text-red-400 font-mono">{fmt(record.baseSalary - record.grossSalary)}</td>
                </tr>
              )}
              <tr className="border-t border-surface-border">
                <td className="px-4 py-3 text-gray-300">Gross Salary</td>
                <td className="px-4 py-3 text-right text-green-400 font-mono font-semibold">{fmt(record.grossSalary)}</td>
                <td className="px-4 py-3 text-gray-300 border-l border-surface-border">Professional Tax</td>
                <td className="px-4 py-3 text-right text-red-400 font-mono">{fmt(record.professionalTax)}</td>
              </tr>
              <tr className="border-t border-surface-border">
                <td colSpan={2} />
                <td className="px-4 py-3 text-gray-400 font-semibold border-l border-surface-border">Total Deductions</td>
                <td className="px-4 py-3 text-right text-red-400 font-mono font-bold">{fmt(record.deductions)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-primary bg-opacity-10 border-t-2 border-primary border-opacity-30">
                <td colSpan={2} className="px-4 py-4 text-primary font-black text-base">💰 Net Salary</td>
                <td colSpan={2} className="px-4 py-4 text-right text-green-400 font-black text-xl font-mono">{fmt(record.netSalary)}</td>
              </tr>
            </tfoot>
          </table>

          <p className="text-center text-gray-600 text-xs">
            This is a computer-generated payslip and does not require a signature.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Payroll Page ────────────────────────────────────────────────────── */
const PayrollPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEmployee = user?.role === 'EMPLOYEE';

  // Period selector
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [workingDays, setWorkingDays] = useState(26);

  // Data
  const [preview,     setPreview]     = useState([]);
  const [myPayroll,   setMyPayroll]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [running,     setRunning]     = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);
  const [companyName, setCompanyName] = useState('');

  // Fetch company name once
  useEffect(() => {
    api.get('/settings/companies').then(r => {
      setCompanyName(r.data?.data?.companies?.[0]?.name || 'EmPay');
    }).catch(() => {});
  }, []);

  // Employee: fetch own payslips
  useEffect(() => {
    if (isEmployee) {
      payrollService.getMyPayroll()
        .then(data => setMyPayroll(data || []))
        .catch(err => toast.error('Failed to load payslips: ' + (err.response?.data?.message || err.message)));
    }
  }, [isEmployee]);

  // Admin/Payroll: fetch preview for selected month
  const fetchPreview = useCallback(async () => {
    if (isEmployee) return;
    setLoading(true);
    try {
      const data = await payrollService.previewPayroll(month, year, workingDays);
      setPreview(data || []);
    } catch (err) {
      toast.error('Failed to load payroll preview: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  }, [month, year, workingDays, isEmployee]);

  useEffect(() => { fetchPreview(); }, [fetchPreview]);

  const handleRunPayroll = async () => {
    const unprocessed = preview.filter(p => !p.alreadyProcessed);
    if (unprocessed.length === 0) {
      toast.error('Payroll already processed for all employees this month.');
      return;
    }
    setRunning(true);
    try {
      const result = await payrollService.runPayroll(month, year, workingDays);
      const { processed, skipped, errors } = result.summary;
      toast.success(`✅ Payrun complete! Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}`);
      fetchPreview();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payrun failed');
    } finally { setRunning(false); }
  };

  // Summary stats
  const totalPayout    = preview.filter(p => p.alreadyProcessed).reduce((s, p) => s + p.netSalary, 0);
  const paidCount      = preview.filter(p => p.alreadyProcessed).length;
  const pendingCount   = preview.filter(p => !p.alreadyProcessed).length;
  const allDone        = preview.length > 0 && pendingCount === 0;

  /* ─── EMPLOYEE VIEW ───────────────────────────────────────── */
  if (isEmployee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary bg-opacity-20 rounded-xl text-primary"><CreditCard size={24} /></div>
          <div>
            <h2 className="text-2xl font-bold text-white">My Payslips</h2>
            <p className="text-gray-400 text-sm">View your salary history</p>
          </div>
        </div>

        {myPayroll.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <CreditCard className="text-gray-700 mx-auto mb-4" size={48} />
            <p className="text-gray-400 font-semibold">No payslips generated yet</p>
            <p className="text-gray-600 text-sm mt-1">Your payslips will appear here once payroll is processed</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-border bg-surface-hover bg-opacity-30">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">Payslip History</h3>
            </div>
            <div className="divide-y divide-surface-border">
              {myPayroll.map(p => (
                <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-hover transition-all group">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-lg bg-primary bg-opacity-15 flex items-center justify-center text-primary">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{MONTHS[p.month - 1]} {p.year}</p>
                      <p className="text-gray-500 text-xs">{p.daysPresent} days present · {p.leavesTaken} paid leaves {p.unpaidLeaves > 0 && `· ${p.unpaidLeaves} unpaid leaves`}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-6">
                    <div>
                      <p className="text-gray-500 text-xs">Net Salary</p>
                      <p className="text-green-400 font-bold font-mono">{fmt(p.netSalary)}</p>
                    </div>
                    <button onClick={() => setSelectedRec({ ...p, name: user.name })}
                      className="p-2 rounded-lg bg-surface-input border border-surface-border text-gray-400 hover:text-primary hover:border-primary transition-all">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedRec && <PayslipModal record={selectedRec} companyName={companyName} onClose={() => setSelectedRec(null)} />}
      </div>
    );
  }

  /* ─── ADMIN / PAYROLL VIEW ────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary bg-opacity-20 rounded-xl text-primary"><CreditCard size={24} /></div>
          <div>
            <h2 className="text-2xl font-bold text-white">Payroll</h2>
            <p className="text-gray-400 text-sm">Process salaries and generate payslips</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Period selectors */}
          <div className="flex items-center space-x-2 bg-surface-input border border-surface-border rounded-xl px-3 py-2">
            <select value={month} onChange={e => setMonth(+e.target.value)}
              className="bg-transparent text-white text-sm outline-none cursor-pointer">
              {MONTHS.map((m, i) => <option key={m} value={i + 1} className="bg-surface-card">{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(+e.target.value)}
              className="bg-transparent text-white text-sm outline-none cursor-pointer">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y} className="bg-surface-card">{y}</option>)}
            </select>
            <div className="flex items-center space-x-1 border-l border-surface-border pl-2 ml-1">
              <span className="text-gray-500 text-xs">Working days:</span>
              <input type="number" min={1} max={31} value={workingDays} onChange={e => setWorkingDays(+e.target.value)}
                className="w-10 bg-transparent text-white text-sm text-center outline-none" />
            </div>
          </div>

          <button onClick={fetchPreview} disabled={loading}
            className="p-2.5 rounded-xl bg-surface-input border border-surface-border text-gray-400 hover:text-white hover:border-primary transition-all">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Generate Payrun */}
          <button onClick={handleRunPayroll} disabled={running || allDone || loading}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              allDone
                ? 'bg-green-500 bg-opacity-15 text-green-400 border border-green-500 border-opacity-30 cursor-not-allowed'
                : 'btn-primary'
            }`}>
            {running ? <Loader2 size={18} className="animate-spin" /> : allDone ? <CheckCircle2 size={18} /> : <Play size={18} />}
            <span>{running ? 'Processing…' : allDone ? 'Payrun Done' : 'Generate Payrun'}</span>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: preview.length, icon: <Users size={20} />, color: 'text-blue-400', bg: 'bg-blue-500' },
          { label: 'Paid This Month', value: paidCount,      icon: <CheckCircle2 size={20} />, color: 'text-green-400', bg: 'bg-green-500' },
          { label: 'Pending',         value: pendingCount,   icon: <AlertCircle size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-500' },
          { label: 'Total Payout',    value: fmt(totalPayout), icon: <DollarSign size={20} />, color: 'text-purple-400', bg: 'bg-purple-500' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
              <div className={`h-8 w-8 ${bg} bg-opacity-15 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
            </div>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Payroll Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border bg-surface-hover bg-opacity-30 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">
            Payroll Preview — {MONTHS[month - 1]} {year}
          </h3>
          {loading && <Loader2 size={16} className="animate-spin text-primary" />}
        </div>

        <div className="overflow-x-auto">
          {preview.length === 0 && !loading ? (
            <div className="p-12 text-center">
              <Users className="text-gray-700 mx-auto mb-4" size={40} />
              <p className="text-gray-400">No employees found. Add employees first.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Employee','Department','Basic Salary','Days Present','Paid Leaves','Unpaid Leaves','Gross Salary','Deductions','Net Salary','Status',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {preview.map((p) => (
                  <tr key={p.employeeId} className="hover:bg-surface-hover transition-all group">
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white font-semibold">{p.name}</p>
                        <p className="text-gray-600 text-xs font-mono">{p.employeeCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-400 whitespace-nowrap">{p.department || '—'}</td>
                    <td className="px-4 py-4 text-gray-300 font-mono whitespace-nowrap">{fmt(p.baseSalary)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-blue-500 bg-opacity-10 text-blue-400 font-bold text-xs">{p.daysPresent}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-green-500 bg-opacity-10 text-green-400 font-bold text-xs">{p.leavesTaken}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-red-500 bg-opacity-10 text-red-400 font-bold text-xs">{p.unpaidLeaves || 0}</span>
                    </td>
                    <td className="px-4 py-4 text-green-400 font-mono font-semibold whitespace-nowrap">{fmt(p.grossSalary)}</td>
                    <td className="px-4 py-4 text-red-400 font-mono whitespace-nowrap">-{fmt(p.deductions)}</td>
                    <td className="px-4 py-4 text-green-400 font-mono font-black whitespace-nowrap">{fmt(p.netSalary)}</td>
                    <td className="px-4 py-4">
                      {p.alreadyProcessed
                        ? <span className="flex items-center space-x-1 text-green-400 text-xs font-bold"><CheckCircle2 size={14}/><span>Done</span></span>
                        : <span className="flex items-center space-x-1 text-yellow-400 text-xs font-bold"><AlertCircle size={14}/><span>Pending</span></span>
                      }
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => setSelectedRec(p)}
                        className="p-1.5 rounded-lg bg-surface-input border border-surface-border text-gray-400 hover:text-primary hover:border-primary transition-all opacity-0 group-hover:opacity-100">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedRec && (
        <PayslipModal
          record={selectedRec}
          companyName={companyName}
          onClose={() => setSelectedRec(null)}
        />
      )}
    </div>
  );
};

export default PayrollPage;
