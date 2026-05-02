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
  Trash2,
  Lock
} from 'lucide-react';
import employeeService from '../../services/employeeService';
import toast from 'react-hot-toast';

const EmployeeProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    designation: '',
    baseSalary: ''
  });

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const data = await employeeService.getEmployeeById(id);
      setEmployee(data);
      setFormData({
        department: data.department,
        designation: data.designation,
        baseSalary: data.baseSalary
      });
    } catch (error) {
      toast.error('Failed to fetch employee details');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await employeeService.updateEmployee(id, formData);
      toast.success('Employee updated successfully');
      setEditMode(false);
      fetchEmployee();
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/employees')}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Back to Employees</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 flex flex-col items-center text-center">
            <div className="h-32 w-32 rounded-full bg-primary bg-opacity-20 flex items-center justify-center text-primary font-bold text-4xl mb-6 border-4 border-primary border-opacity-10 shadow-2xl">
              {employee.user?.email?.[0].toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{employee.user?.email?.split('@')[0]}</h2>
            <p className="text-primary font-semibold text-sm mb-4">{employee.user?.role}</p>
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-6">
              <Mail size={14} />
              <span>{employee.user?.email}</span>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-4 py-6 border-t border-surface-border">
              <div className="text-center">
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Status</p>
                <p className="text-green-500 font-bold text-sm">Active</p>
              </div>
              <div className="text-center border-l border-surface-border">
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Join Date</p>
                <p className="text-white font-bold text-sm">{new Date(employee.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="btn-secondary w-full flex items-center space-x-3 justify-start">
                <Lock size={18} className="text-primary" />
                <span>Reset Password</span>
              </button>
              <button className="btn-secondary w-full flex items-center space-x-3 justify-start text-red-400 hover:bg-red-500 hover:bg-opacity-10 border-red-500 border-opacity-20">
                <Trash2 size={18} />
                <span>Deactivate Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Details/Edit Form */}
        <div className="lg:col-span-2">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center space-x-3">
                <User size={22} className="text-primary" />
                <span>Detailed Profile</span>
              </h3>
              {!editMode ? (
                <button 
                  onClick={() => setEditMode(true)}
                  className="btn-primary"
                >
                  Edit Details
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setEditMode(false)}
                    className="btn-secondary px-4"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdate}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save size={18} />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 flex items-center space-x-2">
                  <Building size={14} />
                  <span>Department</span>
                </label>
                <input 
                  type="text" 
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  disabled={!editMode}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 flex items-center space-x-2">
                  <Briefcase size={14} />
                  <span>Designation</span>
                </label>
                <input 
                  type="text" 
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  disabled={!editMode}
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 flex items-center space-x-2">
                  <CreditCard size={14} />
                  <span>Base Salary (Monthly)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                  <input 
                    type="number" 
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({...formData, baseSalary: e.target.value})}
                    disabled={!editMode}
                    className="input-field pl-8 disabled:opacity-50 disabled:cursor-not-allowed" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 flex items-center space-x-2">
                  <Calendar size={14} />
                  <span>Registration Date</span>
                </label>
                <input 
                  type="text" 
                  value={new Date(employee.createdAt).toLocaleDateString()}
                  disabled
                  className="input-field opacity-50 cursor-not-allowed" 
                />
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-surface-border">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">User Account Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">Account Role</label>
                  <input 
                    type="text" 
                    value={employee.user?.role}
                    disabled
                    className="input-field opacity-50 cursor-not-allowed" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">Login Email</label>
                  <input 
                    type="text" 
                    value={employee.user?.email}
                    disabled
                    className="input-field opacity-50 cursor-not-allowed" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
