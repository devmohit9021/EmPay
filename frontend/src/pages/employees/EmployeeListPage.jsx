import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, X, User, Mail, Lock, Briefcase,
  Building, CreditCard, ShieldCheck, Loader2, Circle,
  CheckCircle2, UserCircle2
} from 'lucide-react';
import employeeService from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ─── Role config ──────────────────────────────────────────────────────────── */
const ROLES = [
  { value: 'EMPLOYEE', label: 'Employee',       color: 'text-blue-400',   bg: 'bg-blue-500'   },
  { value: 'HR',       label: 'HR Officer',     color: 'text-purple-400', bg: 'bg-purple-500' },
  { value: 'PAYROLL',  label: 'Payroll Officer',color: 'text-yellow-400', bg: 'bg-yellow-500' },
  { value: 'ADMIN',    label: 'Admin',          color: 'text-green-400',  bg: 'bg-green-500'  },
];
const roleStyle = (role) => ROLES.find(r => r.value === role) || ROLES[0];

/* ─── Universal User Card ──────────────────────────────────────────────────── */
const UserCard = ({ item, onClick }) => {
  // item shape: { id, name, email, role, department?, designation?, employeeCode?, isCheckedIn? }
  const rs = roleStyle(item.role);
  const initial = (item.name || item.email || '?')[0].toUpperCase();

  return (
    <div
      onClick={onClick}
      className="glass-card p-5 cursor-pointer hover:scale-[1.02] hover:border-primary hover:border-opacity-60 transition-all duration-200 relative flex flex-col items-center text-center space-y-3 group"
    >
      {/* Status dot */}
      <div className="absolute top-3 right-3">
        {item.isCheckedIn
          ? <CheckCircle2 className="text-green-500" size={16} />
          : <Circle className="text-gray-700" size={16} />
        }
      </div>

      {/* Avatar */}
      <div className={`h-20 w-20 rounded-2xl ${rs.bg} bg-opacity-20 border-2 border-current border-opacity-20 flex items-center justify-center group-hover:border-opacity-50 transition-all ${rs.color}`}>
        <span className="font-black text-3xl">{initial}</span>
      </div>

      {/* Info */}
      <div className="space-y-0.5 w-full">
        <p className="text-white font-semibold text-sm leading-tight truncate">{item.name || item.email.split('@')[0]}</p>
        {item.designation && <p className="text-gray-400 text-xs truncate">{item.designation}</p>}
        {item.department  && <p className="text-gray-600 text-[10px] truncate">{item.department}</p>}
        {!item.designation && <p className="text-gray-600 text-xs truncate">{item.email}</p>}
      </div>

      {/* Role badge */}
      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${rs.color} ${rs.bg} bg-opacity-10 border border-current border-opacity-25`}>
        {rs.label}
      </span>

      {/* Employee code */}
      {item.employeeCode && (
        <p className="text-gray-600 font-mono text-[10px]">{item.employeeCode}</p>
      )}
    </div>
  );
};

/* ─── New User Modal ───────────────────────────────────────────────────────── */
const NewUserModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', designation: '', baseSalary: '' });
  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let createdUserId = null;
    try {
      // Step 1: create user account with correct role
      const userRes = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password, role: selectedRole,
      });
      createdUserId = userRes.data.data.user.id;

      // Step 2: if Employee, create employee profile too
      if (selectedRole === 'EMPLOYEE') {
        await api.post('/employees', {
          userId: createdUserId,
          department: form.department,
          designation: form.designation,
          baseSalary: parseFloat(form.baseSalary) || 0,
        });
      }

      toast.success(`${roleStyle(selectedRole).label} "${form.name}" created!`);
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Failed to create user';
      if (createdUserId && err.config?.url?.includes('/employees')) {
        toast.error(`Account created but profile setup failed: ${msg}`);
        onSuccess(); onClose();
      } else {
        toast.error(msg);
      }
    } finally { setLoading(false); }
  };

  const roleOptions = ROLES.filter(r => r.value !== 'ADMIN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={20} /></button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="h-10 w-10 bg-primary bg-opacity-20 rounded-xl flex items-center justify-center">
            <Plus className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Add New User</h3>
            <p className="text-gray-400 text-xs">{step === 1 ? 'Select the role for this user' : `Creating ${roleStyle(selectedRole)?.label} account`}</p>
          </div>
        </div>

        {/* Step 1 — Role selection */}
        {step === 1 && (
          <div className="space-y-3">
            {roleOptions.map(role => (
              <button key={role.value} onClick={() => { setSelectedRole(role.value); setStep(2); }}
                className="w-full flex items-center space-x-4 p-4 rounded-xl bg-surface-hover hover:bg-surface-input border border-surface-border hover:border-primary hover:border-opacity-40 transition-all text-left group">
                <div className={`h-10 w-10 rounded-lg ${role.bg} bg-opacity-15 flex items-center justify-center ${role.color}`}>
                  <UserCircle2 size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{role.label}</p>
                  <p className="text-gray-500 text-xs">
                    {role.value === 'EMPLOYEE' && 'Standard employee — attendance, leaves, payslip'}
                    {role.value === 'HR'       && 'Manage employees, leaves and allocations'}
                    {role.value === 'PAYROLL'  && 'Generate payslips and run payroll calculations'}
                  </p>
                </div>
                <span className="text-gray-600 group-hover:text-primary transition-colors text-lg">›</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button type="button" onClick={() => setStep(1)} className="text-xs text-gray-400 hover:text-primary transition-colors mb-1">← Back to role selection</button>

            <div className={`flex items-center space-x-3 p-3 rounded-xl ${roleStyle(selectedRole).bg} bg-opacity-10 border border-current border-opacity-20 ${roleStyle(selectedRole).color}`}>
              <ShieldCheck size={16} />
              <p className="text-sm text-gray-300">Creating a <span className={`font-bold ${roleStyle(selectedRole).color}`}>{roleStyle(selectedRole).label}</span> account</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-gray-400">Full Name</label>
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input type="text" required value={form.name} onChange={set('name')} className="input-field pl-9 py-2.5 text-sm" placeholder="John Doe" /></div>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-gray-400">Email Address</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input type="email" required value={form.email} onChange={set('email')} className="input-field pl-9 py-2.5 text-sm" placeholder="user@company.com" /></div>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-gray-400">Temporary Password</label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input type="password" required minLength={8} value={form.password} onChange={set('password')} className="input-field pl-9 py-2.5 text-sm" placeholder="Min. 8 characters" /></div>
              </div>

              {selectedRole === 'EMPLOYEE' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400">Department</label>
                    <div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="text" required value={form.department} onChange={set('department')} className="input-field pl-9 py-2.5 text-sm" placeholder="Engineering" /></div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400">Designation</label>
                    <div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="text" required value={form.designation} onChange={set('designation')} className="input-field pl-9 py-2.5 text-sm" placeholder="Software Engineer" /></div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium text-gray-400">Monthly Salary (₹)</label>
                    <div className="relative"><CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="number" required min={0} value={form.baseSalary} onChange={set('baseSalary')} className="input-field pl-9 py-2.5 text-sm" placeholder="50000" /></div>
                  </div>
                </>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center space-x-2 py-3 mt-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /><span>Create {roleStyle(selectedRole)?.label}</span></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
const EmployeeListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allItems, setAllItems] = useState([]); // unified list of all users
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filterRole, setFilterRole] = useState('ALL');

  const isAdmin = user?.role === 'ADMIN';
  const isHR    = user?.role === 'HR';
  const canAdd  = isAdmin || isHR;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch employee profiles
      const emps = await employeeService.getAllEmployees();

      // Map: userId → employee profile data
      const empByUserId = {};
      emps.forEach(e => { if (e.user?.id) empByUserId[e.user.id] = e; });

      // Build unified list starting from employees
      const unified = emps.map(e => ({
        id: e.id,
        userId: e.user?.id,
        name: e.user?.name || e.user?.email?.split('@')[0] || 'Unknown',
        email: e.user?.email,
        role: e.user?.role || 'EMPLOYEE',
        department: e.department,
        designation: e.designation,
        baseSalary: e.baseSalary,
        employeeCode: e.employeeCode,
        isCheckedIn: false,
        hasProfile: true,
      }));

      // Admin & HR: also fetch ALL users to pick up HR/PAYROLL who have no employee profile
      if (canAdd) {
        const usersRes = await api.get('/auth/users');
        const allUsers = usersRes.data.data.users || [];

        allUsers.forEach(u => {
          if (u.role === 'ADMIN') return; // skip admin from the grid
          if (empByUserId[u.id]) {
            // User has employee profile — update role from users table (source of truth)
            const existing = unified.find(item => item.userId === u.id);
            if (existing) existing.role = u.role;
          } else {
            // No employee profile — add as user-only card (HR / PAYROLL)
            unified.push({
              id: null,
              userId: u.id,
              name: u.name || u.email?.split('@')[0] || 'Unknown',
              email: u.email,
              role: u.role,
              department: null,
              designation: null,
              employeeCode: null,
              isCheckedIn: false,
              hasProfile: false,
            });
          }
        });
      }

      setAllItems(unified);
    } catch (err) {
      console.error('fetchData error:', err);
      toast.error('Failed to load users: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filtered list
  const filtered = allItems.filter(item => {
    const haystack = [item.name, item.email, item.department, item.designation].join(' ').toLowerCase();
    const matchSearch = !searchTerm || haystack.includes(searchTerm.toLowerCase());
    const matchRole   = filterRole === 'ALL' || item.role === filterRole;
    return matchSearch && matchRole;
  });

  const filterPills = ['ALL', 'EMPLOYEE', 'HR', 'PAYROLL'];

  return (
    <div className="space-y-6">

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {canAdd && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2 px-5 py-2.5 font-bold">
            <Plus size={18} /><span>NEW</span>
          </button>
        )}

        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name, department or designation..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9 py-2.5 text-sm" />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14} /></button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {filterPills.map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                filterRole === r
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'bg-surface-input text-gray-400 border border-surface-border hover:border-primary hover:border-opacity-40'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cards Grid ───────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center text-center space-y-4">
          <UserCircle2 className="text-gray-700" size={48} />
          <div>
            <p className="text-gray-400 font-semibold">No users found</p>
            <p className="text-gray-600 text-sm mt-1">
              {searchTerm ? 'Try a different search term' : filterRole !== 'ALL' ? `No ${filterRole} users yet` : canAdd ? 'Click NEW to add your first user' : 'No users yet'}
            </p>
          </div>
          {canAdd && !searchTerm && filterRole === 'ALL' && (
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2 mt-2">
              <Plus size={16} /><span>Add First Employee</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((item, idx) => (
              <UserCard
                key={item.userId || idx}
                item={item}
                onClick={() => item.id ? navigate(`/employees/${item.id}`) : undefined}
              />
            ))}
          </div>
        </>
      )}

      {showModal && <NewUserModal onClose={() => setShowModal(false)} onSuccess={fetchData} />}
    </div>
  );
};

export default EmployeeListPage;
