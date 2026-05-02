import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Briefcase,
  Building,
  CreditCard,
  Calendar,
  Save,
  Edit2,
  AlertTriangle,
  UserX,
  UserCheck,
  BadgeCheck,
  Hash,
  Landmark
} from 'lucide-react';
import employeeService from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EmployeeProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    designation: '',
    baseSalary: '',
    bankAccountNo: '',
    bankName: '',
    ifscCode: '',
  });

  const isPayroll = user?.role === 'PAYROLL';
  const isEmployee = user?.role === 'EMPLOYEE';

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      // No id in URL (e.g. /profile route) OR id === 'me' → load own profile
      const data = (!id || id === 'me')
        ? await employeeService.getMyProfile()
        : await employeeService.getEmployeeById(id);
      setEmployee(data);
      setFormData({
        department: data.department || '',
        designation: data.designation || '',
        baseSalary: data.baseSalary || '',
        bankAccountNo: data.bankAccountNo || '',
        bankName: data.bankName || '',
        ifscCode: data.ifscCode || '',
      });
    } catch (error) {
      toast.error('Failed to fetch employee details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // PAYROLL: send only baseSalary. Others can send all fields.
      const payload = isPayroll
        ? { baseSalary: Number(formData.baseSalary) }
        : {
            department: formData.department,
            designation: formData.designation,
            baseSalary: Number(formData.baseSalary),
            bankAccountNo: formData.bankAccountNo || null,
            bankName: formData.bankName || null,
            ifscCode: formData.ifscCode || null,
          };

      await employeeService.updateEmployee(employee.id, payload);
      toast.success('Profile updated successfully ✓');
      setEditMode(false);
      fetchEmployee();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  if (!employee) return null;

  const hasWarnings = employee.warnings?.length > 0;
  const hasManager = employee.managerStatus === 'assigned';

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      {/* Bank/Manager Warnings (Issue #17) */}
      {hasWarnings && (
        <div className="space-y-2">
          {employee.warnings.map((w, i) => (
            <div key={i} className="flex items-start space-x-3 p-4 rounded-xl bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30">
              <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-yellow-400 text-sm">{w}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 flex flex-col items-center text-center">
            <div className="h-28 w-28 rounded-full bg-primary bg-opacity-20 flex items-center justify-center text-primary font-bold text-4xl mb-5 border-4 border-primary border-opacity-10 shadow-2xl">
              {employee.user?.name?.[0]?.toUpperCase() || employee.user?.email?.[0]?.toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-white mb-0.5">{employee.user?.name || 'Employee'}</h2>
            <p className="text-primary font-semibold text-sm mb-1">{employee.designation}</p>
            <p className="text-gray-500 text-xs mb-3">{employee.department}</p>

            {/* Employee Code */}
            {employee.employeeCode && (
              <div className="flex items-center space-x-2 text-gray-400 text-xs mb-3 bg-surface-input px-3 py-1.5 rounded-lg border border-surface-border">
                <Hash size={12} />
                <span className="font-mono font-bold text-primary">{employee.employeeCode}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-6">
              <Mail size={14} />
              <span>{employee.user?.email}</span>
            </div>

            {/* Manager Status (Issue #17) */}
            <div className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold ${hasManager ? 'bg-green-500 bg-opacity-10 text-green-400 border border-green-500 border-opacity-20' : 'bg-gray-500 bg-opacity-10 text-gray-400 border border-gray-500 border-opacity-20'}`}>
              {hasManager ? <UserCheck size={16} /> : <UserX size={16} />}
              <span>{hasManager ? `Manager: ${employee.manager?.name || employee.manager?.employeeCode}` : 'Employee without manager'}</span>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 py-6 border-t border-surface-border mt-4">
              <div className="text-center">
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Role</p>
                <p className="text-primary font-bold text-sm">{employee.user?.role}</p>
              </div>
              <div className="text-center border-l border-surface-border">
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Joined</p>
                <p className="text-white font-bold text-sm">{employee.joinedAt ? new Date(employee.joinedAt).getFullYear() : '—'}</p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          {employee.company && (
            <div className="glass-card p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center space-x-2">
                <Building size={12} />
                <span>Company</span>
              </h3>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-primary bg-opacity-10 border border-primary border-opacity-20 flex items-center justify-center">
                  <span className="text-primary font-black text-sm">{employee.company.code}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{employee.company.name}</p>
                  <p className="text-gray-500 text-xs">Code: {employee.company.code}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right — Details/Edit Form */}
        <div className="lg:col-span-2">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center space-x-3">
                <User size={22} className="text-primary" />
                <span>Employee Details</span>
              </h3>
              {/* Issue #15 — Allow ADMIN, HR, EMPLOYEE (own profile) to edit */}
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="btn-primary flex items-center space-x-2">
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button onClick={() => setEditMode(false)} className="btn-secondary px-4">Cancel</button>
                  <button onClick={handleUpdate} disabled={saving} className="btn-primary flex items-center space-x-2">
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department — hidden for PAYROLL role */}
              {!isPayroll && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400 flex items-center space-x-2">
                    <Building size={14} />
                    <span>Department</span>
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    disabled={!editMode}
                    className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              {!isPayroll && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400 flex items-center space-x-2">
                    <Briefcase size={14} />
                    <span>Designation</span>
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    disabled={!editMode}
                    className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              {/* Salary — EMPLOYEE cannot see it */}
              {!isEmployee && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400 flex items-center space-x-2">
                    <CreditCard size={14} />
                    <span>Base Salary (₹/month)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.baseSalary}
                    onChange={e => setFormData({ ...formData, baseSalary: e.target.value })}
                    disabled={!editMode}
                    className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 flex items-center space-x-2">
                  <Calendar size={14} />
                  <span>Joined</span>
                </label>
                <input
                  type="text"
                  value={employee.joinedAt ? new Date(employee.joinedAt).toLocaleDateString() : '—'}
                  disabled
                  className="input-field opacity-50 cursor-not-allowed"
                />
              </div>
            </form>

            {/* Bank Details Section (Issue #17 — employee can edit their own bank info) */}
            {!isPayroll && (
              <div className="mt-8 pt-8 border-t border-surface-border">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center space-x-2">
                  <Landmark size={14} />
                  <span>Bank Details</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Account Number</label>
                    <input
                      type="text"
                      value={formData.bankAccountNo}
                      onChange={e => setFormData({ ...formData, bankAccountNo: e.target.value })}
                      disabled={!editMode}
                      placeholder="Enter account number"
                      className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                      disabled={!editMode}
                      placeholder="e.g. HDFC Bank"
                      className="input-field disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.ifscCode}
                      onChange={e => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                      disabled={!editMode}
                      placeholder="e.g. HDFC0001234"
                      className="input-field disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
