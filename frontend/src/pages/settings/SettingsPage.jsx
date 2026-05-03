import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Users,
  Plus,
  ChevronRight,
  Shield,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Hash
} from 'lucide-react';
import employeeService from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = ['EMPLOYEE', 'HR', 'PAYROLL', 'ADMIN'];

const roleColors = {
  ADMIN: 'text-red-400 bg-red-500 bg-opacity-10 border-red-500 border-opacity-30',
  HR: 'text-blue-400 bg-blue-500 bg-opacity-10 border-blue-500 border-opacity-30',
  PAYROLL: 'text-green-400 bg-green-500 bg-opacity-10 border-green-500 border-opacity-30',
  EMPLOYEE: 'text-gray-400 bg-gray-500 bg-opacity-10 border-gray-500 border-opacity-30',
};

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({ name: '', code: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'company') {
        const data = await employeeService.getCompanies();
        setCompanies(Array.isArray(data) ? data : []);
      } else {
        const data = await employeeService.getAllUsers();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (companyForm.code.length !== 2) {
      toast.error('Company code must be exactly 2 characters');
      return;
    }
    setSaving(true);
    try {
      await employeeService.createCompany(companyForm);
      toast.success(`Company "${companyForm.name}" created!`);
      setShowAddCompany(false);
      setCompanyForm({ name: '', code: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create company');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === user?.id) {
      toast.error("You cannot change your own role.");
      return;
    }
    try {
      await employeeService.changeUserRole(userId, newRole);
      toast.success('Role updated successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-primary bg-opacity-20 rounded-xl text-primary">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">System Settings</h2>
          <p className="text-gray-400 text-sm">Manage companies, users, and access control</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-surface-input p-1 rounded-xl border border-surface-border w-fit">
        {[{ key: 'company', label: 'Companies', icon: <Building2 size={16} /> },
          { key: 'users', label: 'User Roles', icon: <Users size={16} /> }].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white'}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Company Management */}
      {activeTab === 'company' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Building2 size={20} className="text-primary" />
              <span>Registered Companies</span>
            </h3>
            <button
              onClick={() => setShowAddCompany(true)}
              className="btn-primary flex items-center space-x-2 px-5 py-2"
            >
              <Plus size={18} />
              <span>Add Company</span>
            </button>
          </div>

          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : companies.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="mx-auto text-gray-600 mb-3" size={32} />
                <p className="text-gray-500 italic">No companies registered yet.</p>
                <p className="text-sm text-primary mt-2">Add your first company to start onboarding employees.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-border">
                {companies.map(company => (
                  <div key={company.id} className="p-6 flex items-center justify-between hover:bg-surface-hover transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-xl bg-primary bg-opacity-10 border border-primary border-opacity-20 flex items-center justify-center">
                        <span className="text-primary font-black text-lg">{company.code}</span>
                      </div>
                      <div>
                        <p className="text-white font-bold">{company.name}</p>
                        <p className="text-gray-400 text-xs flex items-center space-x-1">
                          <Hash size={10} />
                          <span>Code: {company.code} · ID: {company.id?.substring(0, 8)}…</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 bg-opacity-10 text-green-500 border border-green-500 border-opacity-20 flex items-center space-x-1">
                        <CheckCircle size={12} />
                        <span>Active</span>
                      </span>
                      <ChevronRight size={18} className="text-gray-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Company Modal */}
          {showAddCompany && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setShowAddCompany(false)} />
              <div className="glass-card w-full max-w-md p-8 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Register New Company</h3>
                  <button onClick={() => setShowAddCompany(false)} className="text-gray-400 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleCreateCompany} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Company Name</label>
                    <input
                      type="text"
                      required
                      value={companyForm.name}
                      onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                      placeholder="e.g. Orbis Innovations"
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Company Code (2 letters)</label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={companyForm.code}
                      onChange={e => setCompanyForm({ ...companyForm, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. OI"
                      className="input-field uppercase font-mono text-center text-lg tracking-widest"
                    />
                    <p className="text-xs text-gray-500">Used in employee code generation (e.g. OI + PR + TR + 2024 + 0001)</p>
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button type="button" onClick={() => setShowAddCompany(false)} className="btn-secondary flex-1">Cancel</button>
                    <button type="submit" disabled={saving} className="btn-primary flex-1">
                      {saving ? 'Creating...' : 'Create Company'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Role Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Shield size={20} className="text-primary" />
            <span>User Access Control</span>
          </h3>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-hover text-gray-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Current Role</th>
                    <th className="px-6 py-4 font-semibold">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">No users found.</td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="hover:bg-surface-hover transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-9 w-9 rounded-full bg-primary bg-opacity-20 border border-primary border-opacity-20 flex items-center justify-center text-primary font-bold text-sm">
                              {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-white font-semibold text-sm">{u.name || '—'}</span>
                            {u.id === user?.id && (
                              <span className="text-[10px] px-2 py-0.5 bg-primary bg-opacity-20 text-primary rounded-full font-bold">You</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roleColors[u.role] || roleColors.EMPLOYEE}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            disabled={u.id === user?.id}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            className="bg-surface-input border border-surface-border text-white text-sm rounded-lg px-3 py-1.5 focus:border-primary focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {ROLES.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
