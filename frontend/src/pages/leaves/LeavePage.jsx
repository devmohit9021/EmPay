import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar, Plus, Check, X, Clock, MessageSquare,
  AlertCircle, ChevronDown, Paperclip, Upload,
  User, BarChart2, Gift, Loader2, Users
} from 'lucide-react';
import leaveService from '../../services/leaveService';
import employeeService from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/* ─── Allocate Leave Modal (HR / Admin) ────────────────────────────────────── */
const AllocateModal = ({ onClose, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    year: new Date().getFullYear().toString(),
    daysToGrant: '21',
  });

  useEffect(() => {
    employeeService.getAllEmployees()
      .then(emps => setEmployees(emps))
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId) { toast.error('Please select an employee'); return; }
    setSubmitting(true);
    try {
      await leaveService.allocateLeaves({
        employeeId: form.employeeId,
        year: parseInt(form.year),
        daysToGrant: parseInt(form.daysToGrant),
      });
      const emp = employees.find(e => e.id === form.employeeId);
      const name = emp?.user?.name || emp?.user?.email?.split('@')[0] || 'Employee';
      toast.success(`Allocated ${form.daysToGrant} leave days to ${name} for ${form.year}`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to allocate leaves');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="h-10 w-10 bg-green-500 bg-opacity-20 rounded-xl flex items-center justify-center text-green-400">
            <Gift size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Allocate Leaves</h3>
            <p className="text-gray-400 text-xs">Grant annual leave balance to an employee</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Employee selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Select Employee</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={form.employeeId}
                  onChange={e => setForm({ ...form, employeeId: e.target.value })}
                  className="input-field pl-9 appearance-none"
                  required
                >
                  <option value="">— Choose an employee —</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.user?.name || emp.user?.email?.split('@')[0]} ({emp.employeeCode || emp.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Year</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2099}
                    value={form.year}
                    onChange={e => setForm({ ...form, year: e.target.value })}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              {/* Days to Grant */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Days to Grant</label>
                <div className="relative">
                  <BarChart2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    required
                    min={1}
                    max={365}
                    value={form.daysToGrant}
                    onChange={e => setForm({ ...form, daysToGrant: e.target.value })}
                    className="input-field pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {form.employeeId && form.daysToGrant && (
              <div className="flex items-center space-x-3 p-3 bg-green-500 bg-opacity-10 rounded-xl border border-green-500 border-opacity-20">
                <Check className="text-green-400 flex-shrink-0" size={16} />
                <p className="text-sm text-gray-300">
                  Will grant <span className="text-green-400 font-bold">{form.daysToGrant} days</span> of leave
                  for <span className="text-white font-semibold">{form.year}</span> to{' '}
                  <span className="text-white font-semibold">
                    {employees.find(e => e.id === form.employeeId)?.user?.name || 'this employee'}
                  </span>
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center space-x-2">
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Gift size={18} /><span>Allocate</span></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ─── Main Leave Page ────────────────────────────────────────────────────────── */
const LeavePage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '' });
  const fileInputRef = useRef(null);

  const isAdminOrHR = ['ADMIN', 'HR'].includes(user?.role);
  const isManagement = ['ADMIN', 'HR', 'PAYROLL'].includes(user?.role);
  const isEmployee = user?.role === 'EMPLOYEE';

  useEffect(() => { 
    fetchLeaves(); 
    if (isEmployee) {
      fetchMyBalance();
    }
  }, []);

  const fetchMyBalance = async () => {
    try {
      // Need our own employeeId to fetch balance since leaves array might be empty
      const myProfile = await employeeService.getMyProfile();
      if (myProfile?.id) {
        const bal = await leaveService.getLeaveBalance(myProfile.id);
        setBalance(bal);
      }
    } catch { /* silent */ }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = isManagement
        ? await leaveService.getAllLeaves()
        : await leaveService.getMyLeaves();
      setLeaves(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await leaveService.applyLeave(formData, documentFile);
      toast.success('Leave application submitted!');
      setShowApplyModal(false);
      setDocumentFile(null);
      setFormData({ startDate: '', endDate: '', reason: '' });
      fetchLeaves();
      if (isEmployee) fetchMyBalance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'APPROVE') {
        const approvedLeave = await leaveService.approveLeave(id);
        if (approvedLeave?.unpaidDays > 0) {
          toast.success('Insufficient leave balance. Extra approved days will be treated as unpaid and salary will be deducted.', {
            duration: 6000,
          });
        } else {
          toast.success('Leave approved ✓');
        }
      } else {
        await leaveService.rejectLeave(id);
        toast.success('Leave rejected');
      }
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave status');
    }
  };

  const statusStyle = (s) => ({
    APPROVED: 'text-green-500 bg-green-500 bg-opacity-10 border-green-500 border-opacity-20',
    REJECTED: 'text-red-500 bg-red-500 bg-opacity-10 border-red-500 border-opacity-20',
    PENDING:  'text-yellow-400 bg-yellow-400 bg-opacity-10 border-yellow-400 border-opacity-20',
  }[s] || 'text-primary bg-primary bg-opacity-10 border-primary border-opacity-20');

  const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;
  const pendingCount  = leaves.filter(l => l.status === 'PENDING').length;
  const remaining     = balance ? (balance.totalGranted - balance.used) : '—';

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary bg-opacity-20 rounded-xl text-primary">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Leave Management</h2>
            <p className="text-gray-400 text-sm">
              {isManagement ? 'Manage and review leave applications' : 'Request and track your time off'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* HR / Admin: Allocate button */}
          {isAdminOrHR && (
            <button
              onClick={() => setShowAllocateModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-green-500 bg-opacity-15 border border-green-500 border-opacity-30 text-green-400 hover:bg-opacity-25 transition-all font-semibold text-sm"
            >
              <Gift size={18} />
              <span>Allocate Leaves</span>
            </button>
          )}

          {/* Employee: Apply button */}
          {isEmployee && (
            <button onClick={() => setShowApplyModal(true)} className="btn-primary flex items-center space-x-2 px-6 py-3">
              <Plus size={20} />
              <span>Request Leave</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Summary Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Approved Leaves</p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-white">{approvedCount}</h3>
            <div className="h-10 w-10 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center text-green-500">
              <Check size={20} />
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Pending Requests</p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-white">{pendingCount}</h3>
            <div className="h-10 w-10 bg-yellow-400 bg-opacity-10 rounded-lg flex items-center justify-center text-yellow-400">
              <Clock size={20} />
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            {isEmployee ? 'Remaining Balance' : 'Total Applications'}
          </p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-green-500">{isEmployee ? remaining : leaves.length}</h3>
            <div className="h-10 w-10 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center text-green-500">
              <BarChart2 size={20} />
            </div>
          </div>
          {isEmployee && balance && (
            <p className="text-xs text-gray-500 mt-2">{balance.used} used of {balance.totalGranted} granted</p>
          )}
        </div>
      </div>

      {/* ── Applications List ─────────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-hover bg-opacity-30">
          <h3 className="font-bold text-white uppercase text-xs tracking-widest">
            {isManagement ? 'All Leave Applications' : 'My Applications'}
          </h3>
          {isManagement && (
            <span className="text-xs text-gray-500">{pendingCount} pending review</span>
          )}
        </div>

        <div className="divide-y divide-surface-border">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin text-primary mx-auto mb-3" size={28} />
              <p className="text-gray-400 text-sm">Loading leave requests...</p>
            </div>
          ) : leaves.length === 0 ? (
            <div className="p-12 text-center text-gray-500 italic">No leave applications found.</div>
          ) : (
            leaves.map((leave) => (
              <div key={leave.id} className="p-6 hover:bg-surface-hover transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start space-x-4">
                    {/* Date badge */}
                    <div className="h-12 w-12 rounded-xl bg-surface-input border border-surface-border flex flex-col items-center justify-center text-gray-400 group-hover:border-primary group-hover:text-primary transition-all flex-shrink-0">
                      <span className="text-[10px] font-bold uppercase">
                        {new Date(leave.startDate).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold leading-none">{new Date(leave.startDate).getDate()}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-white font-bold">Leave Request</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusStyle(leave.status)}`}>
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm flex items-center space-x-2">
                        <Calendar size={14} />
                        <span>
                          {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                      </p>
                      {/* Employee name for managers */}
                      {isManagement && leave.employeeName && (
                        <p className="text-xs text-primary font-semibold flex items-center space-x-1">
                          <User size={12} />
                          <span>{leave.employeeName}</span>
                          {leave.employeeCode && <span className="text-gray-500">({leave.employeeCode})</span>}
                          {leave.department && <span className="text-gray-500 ml-1">· {leave.department}</span>}
                        </p>
                      )}
                      {/* Document link */}
                      {leave.documentUrl && (
                        <a href={`http://localhost:5000/${leave.documentUrl}`} target="_blank" rel="noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                          <Paperclip size={12} />
                          <span>View Document</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="flex-1 max-w-md hidden md:block">
                    <div className="flex items-start space-x-2 text-gray-400 italic text-sm">
                      <MessageSquare size={14} className="mt-1 flex-shrink-0" />
                      <p className="line-clamp-2">{leave.reason || 'No reason provided.'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    {isManagement && leave.status === 'PENDING' ? (
                      <>
                        <button onClick={() => handleAction(leave.id, 'REJECT')}
                          className="p-2 rounded-lg bg-red-500 bg-opacity-10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500 border-opacity-30"
                          title="Reject">
                          <X size={20} />
                        </button>
                        <button onClick={() => handleAction(leave.id, 'APPROVE')}
                          className="p-2 rounded-lg bg-green-500 bg-opacity-10 text-green-500 hover:bg-green-500 hover:text-white transition-all border border-green-500 border-opacity-30"
                          title="Approve">
                          <Check size={20} />
                        </button>
                      </>
                    ) : (
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${statusStyle(leave.status)}`}>
                        {leave.status}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Apply Modal (Employee) ────────────────────────────── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setShowApplyModal(false)} />
          <div className="glass-card w-full max-w-lg p-8 relative z-10">
            <button onClick={() => setShowApplyModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <Calendar className="text-primary" />
              <span>Apply for Leave</span>
            </h3>

            <form onSubmit={handleApply} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Start Date</label>
                  <input type="date" required value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">End Date</label>
                  <input type="date" required value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Reason / Description</label>
                <textarea rows="4" required value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  className="input-field resize-none py-3"
                  placeholder="Tell us why you need time off..." />
              </div>

              {/* Document upload */}
              <div>
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                  onChange={e => setDocumentFile(e.target.files[0])} />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center space-x-3 p-4 bg-surface-input rounded-xl border border-dashed border-surface-border text-gray-400 hover:text-white hover:border-primary cursor-pointer transition-all">
                  <Upload size={18} />
                  <span className="text-sm">
                    {documentFile ? `📎 ${documentFile.name}` : 'Attach document (optional) — PDF, JPG, PNG'}
                  </span>
                </button>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <button type="button" onClick={() => { setShowApplyModal(false); setDocumentFile(null); }}
                  className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3">
                  {submitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Allocate Modal (HR / Admin) ───────────────────────── */}
      {showAllocateModal && (
        <AllocateModal
          onClose={() => setShowAllocateModal(false)}
          onSuccess={fetchLeaves}
        />
      )}
    </div>
  );
};

export default LeavePage;
