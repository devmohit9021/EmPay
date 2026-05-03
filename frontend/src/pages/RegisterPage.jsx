import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Mail, Lock, Building, Briefcase, CreditCard, ShieldCheck } from 'lucide-react';
import employeeService from '../services/employeeService';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    designation: '',
    baseSalary: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Register creates user with EMPLOYEE role — Admin assigns actual role via Settings
      await employeeService.registerEmployee({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        designation: formData.designation,
        baseSalary: parseFloat(formData.baseSalary)
      });

      toast.success('New employee added successfully');
      navigate('/employees');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create employee';
      if (error.response?.data?.errors) {
        toast.error(error.response.data.errors[0].message);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/employees')}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Back to Employees</span>
      </button>

      <div className="glass-card p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="h-12 w-12 bg-primary bg-opacity-20 rounded-xl flex items-center justify-center text-primary">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Add New Employee</h2>
            <p className="text-gray-400 text-sm">Create a new user account. Role is assigned via Settings after creation.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Section 1: Account Credentials ─────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-surface-border pb-2">
              Account Credentials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={set('name')}
                    className="input-field pl-10"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={set('email')}
                    className="input-field pl-10"
                    placeholder="employee@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Temporary Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={set('password')}
                    className="input-field pl-10"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>
            </div>

            {/* Role info — no dropdown */}
            <div className="flex items-start space-x-3 p-4 bg-primary bg-opacity-10 rounded-xl border border-primary border-opacity-20">
              <ShieldCheck className="text-primary flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-gray-300">
                This account will be created with the{' '}
                <span className="text-primary font-bold">Employee</span> role.
                You can promote them later in{' '}
                <span className="text-white font-semibold">Settings → User Roles</span>.
              </p>
            </div>
          </section>

          {/* ── Section 2: Professional Profile ─────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-surface-border pb-2">
              Professional Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={set('department')}
                    className="input-field pl-10"
                    placeholder="e.g. Engineering"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Designation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={set('designation')}
                    className="input-field pl-10"
                    placeholder="e.g. Senior Developer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Monthly Base Salary (₹)</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.baseSalary}
                    onChange={set('baseSalary')}
                    className="input-field pl-10"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <div className="flex justify-end pt-6 border-t border-surface-border">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2 py-3 px-10"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Create Employee</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
