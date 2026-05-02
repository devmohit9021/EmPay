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
    role: 'EMPLOYEE',
    department: '',
    designation: '',
    baseSalary: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Register the user and profile in one atomic call
      await employeeService.registerEmployee({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        designation: formData.designation,
        baseSalary: parseFloat(formData.baseSalary)
      });

      toast.success('New employee added successfully');
      navigate('/employees');
    } catch (error) {
      console.error('Registration/Setup error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to setup employee';
      
      // Check for validation errors array from Zod
      if (error.response?.data?.errors) {
        toast.error(error.response.data.errors[0].message);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-gray-400 text-sm">Create a new user account and employee profile</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Account Information Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-surface-border pb-2">Account Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input-field pl-10" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">System Role</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="input-field pl-10 appearance-none"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="HR">HR Officer</option>
                    <option value="PAYROLL">Payroll Officer</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Profile Information Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-surface-border pb-2">Professional Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    className="input-field pl-10" 
                    placeholder="e.g. Senior Developer" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Monthly Base Salary</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="number" 
                    required
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({...formData, baseSalary: e.target.value})}
                    className="input-field pl-10" 
                    placeholder="e.g. 50000" 
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end pt-6 border-t border-surface-border">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary flex items-center space-x-2 py-3 px-10"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
