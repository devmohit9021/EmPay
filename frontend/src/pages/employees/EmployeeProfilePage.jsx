import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Save, User, Mail, Building, MapPin, Phone, Hash, CreditCard, Shield, Landmark, X, Plus, BadgeCheck
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
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState('Resume');
  
  // Global edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const canEdit = user?.role === 'ADMIN' || user?.role === 'HR' || id === 'me';
  const isPayroll = user?.role === 'PAYROLL';

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const data = (!id || id === 'me')
        ? await employeeService.getMyProfile()
        : await employeeService.getEmployeeById(id);
      
      setEmployee(data);
      setFormData({
        mobile: data.mobile || '',
        department: data.department || '',
        location: data.location || '',
        about: data.about || '',
        jobLove: data.jobLove || '',
        hobbies: data.hobbies || '',
        bankName: data.bankName || '',
        bankAccountNo: data.bankAccountNo || '',
        ifscCode: data.ifscCode || '',
        baseSalary: data.baseSalary || '',
        skills: data.skills || [],
        certifications: data.certifications || [],
      });
    } catch (error) {
      toast.error('Failed to fetch employee details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      let payload = { ...formData };
      if (payload.baseSalary) payload.baseSalary = Number(payload.baseSalary);

      if (!employee.id) {
        // Admin setting up profile for the first time
        payload.userId = employee.user?.id || user.id;
        payload.companyId = employee.company?.id;
        // Provide defaults for required fields if empty
        if (!payload.department) payload.department = 'Administration';
        if (!payload.designation) payload.designation = 'Admin';
        if (!payload.baseSalary) payload.baseSalary = 0;
        
        await employeeService.createEmployee(payload);
        toast.success('Profile created successfully ✓');
      } else {
        await employeeService.updateEmployee(employee.id, payload);
        toast.success('Profile updated successfully ✓');
      }
      
      setIsEditing(false);
      fetchEmployee();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayAdd = (field) => {
    const val = document.getElementById(`add_${field}`).value;
    if (!val.trim()) return;
    setFormData({ ...formData, [field]: [...formData[field], val.trim()] });
    document.getElementById(`add_${field}`).value = '';
  };

  const handleArrayRemove = (field, idx) => {
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== idx) });
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!employee) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-surface-input border border-surface-border text-gray-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
        </div>
        
        {canEdit && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 bg-surface-input border border-surface-border rounded-lg text-white font-bold hover:bg-surface-hover">
            <Edit2 size={16} className="mr-2" /> Edit Profile
          </button>
        )}
        
        {isEditing && (
          <div className="flex space-x-3">
            <button onClick={() => { setIsEditing(false); fetchEmployee(); }} className="px-4 py-2 bg-surface-hover text-gray-400 font-bold rounded-lg hover:text-white">
              Cancel
            </button>
            <button onClick={handleSaveAll} disabled={saving} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-80 disabled:opacity-50">
              <Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}
      </div>

      {/* Top Section */}
      <div className="glass-card p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          <div className="shrink-0 flex flex-col items-center">
            <div className="h-40 w-40 rounded-full bg-red-900 bg-opacity-30 border border-red-800 flex items-center justify-center text-red-700 overflow-hidden">
              {employee.profilePhoto ? (
                <img src={employee.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User size={64} className="opacity-50" />
              )}
            </div>
          </div>

          <div className="flex-1 w-full space-y-4">
            <div>
              <p className="text-gray-500 text-xs mb-1">Name</p>
              <div className="text-3xl font-black text-white border-b border-gray-700 pb-2">{employee.user?.name}</div>
            </div>
            
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
              <span className="text-gray-500 text-sm">Login ID</span>
              <div className="border-b border-gray-700 py-1 text-white text-sm font-mono">{employee.employeeCode || '—'}</div>
            </div>
            
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
              <span className="text-gray-500 text-sm">Email</span>
              <div className="border-b border-gray-700 py-1 text-white text-sm">{employee.user?.email}</div>
            </div>
            
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
              <span className="text-gray-500 text-sm">Mobile</span>
              {isEditing ? (
                <input name="mobile" value={formData.mobile} onChange={handleChange} className="bg-surface-input border border-surface-border rounded px-2 py-1 text-sm text-white focus:border-primary focus:outline-none" placeholder="Enter mobile" />
              ) : (
                <div className="border-b border-gray-700 py-1 text-sm text-gray-300">{formData.mobile || <span className="text-gray-600 italic">Not added</span>}</div>
              )}
            </div>
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
              <span className="text-gray-500 text-sm">Company</span>
              <div className="border-b border-gray-700 py-1 text-white text-sm">{employee.company?.name || '—'}</div>
            </div>
            
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
              <span className="text-gray-500 text-sm">Department</span>
              {isEditing ? (
                <input name="department" value={formData.department} onChange={handleChange} className="bg-surface-input border border-surface-border rounded px-2 py-1 text-sm text-white focus:border-primary focus:outline-none" placeholder="Enter department" />
              ) : (
                <div className="border-b border-gray-700 py-1 text-sm text-gray-300">{formData.department || <span className="text-gray-600 italic">Not added</span>}</div>
              )}
            </div>
            
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
              <span className="text-gray-500 text-sm">Manager</span>
              <div className="border-b border-gray-700 py-1 text-white text-sm">{employee.manager?.name || '—'}</div>
            </div>
            
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
              <span className="text-gray-500 text-sm">Location</span>
              {isEditing ? (
                <input name="location" value={formData.location} onChange={handleChange} className="bg-surface-input border border-surface-border rounded px-2 py-1 text-sm text-white focus:border-primary focus:outline-none" placeholder="Enter location" />
              ) : (
                <div className="border-b border-gray-700 py-1 text-sm text-gray-300">{formData.location || <span className="text-gray-600 italic">Not added</span>}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-surface-border">
        {['Resume', 'Private Info', 'Salary Info', 'Security'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-sm font-bold border-t border-l border-r rounded-t-lg transition-all ${activeTab === tab ? 'bg-bg text-white border-surface-border -mb-[1px]' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-surface-hover'}`}>{tab}</button>
        ))}
      </div>

      <div className="mt-6">
        
        {/* RESUME TAB */}
        {activeTab === 'Resume' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              
              <div className="glass-card p-6">
                <h4 className="text-white font-bold mb-2">About</h4>
                {isEditing ? (
                  <textarea name="about" value={formData.about} onChange={handleChange} className="w-full bg-surface-input border border-surface-border rounded-lg p-3 text-sm text-white focus:border-primary focus:outline-none min-h-[100px]" placeholder="Write about yourself..." />
                ) : (
                  <p className="text-sm text-gray-300">{formData.about || <span className="text-gray-600 italic">Not added</span>}</p>
                )}
              </div>
              
              <div className="glass-card p-6">
                <h4 className="text-white font-bold mb-2">What I love about my job</h4>
                {isEditing ? (
                  <textarea name="jobLove" value={formData.jobLove} onChange={handleChange} className="w-full bg-surface-input border border-surface-border rounded-lg p-3 text-sm text-white focus:border-primary focus:outline-none min-h-[100px]" placeholder="What do you love..." />
                ) : (
                  <p className="text-sm text-gray-300">{formData.jobLove || <span className="text-gray-600 italic">Not added</span>}</p>
                )}
              </div>
              
              <div className="glass-card p-6">
                <h4 className="text-white font-bold mb-2">My interests and hobbies</h4>
                {isEditing ? (
                  <textarea name="hobbies" value={formData.hobbies} onChange={handleChange} className="w-full bg-surface-input border border-surface-border rounded-lg p-3 text-sm text-white focus:border-primary focus:outline-none min-h-[100px]" placeholder="Your hobbies..." />
                ) : (
                  <p className="text-sm text-gray-300">{formData.hobbies || <span className="text-gray-600 italic">Not added</span>}</p>
                )}
              </div>
              
            </div>
            
            <div className="space-y-6">
              <div className="border border-surface-border rounded-lg overflow-hidden bg-bg">
                <div className="border-b border-surface-border p-4 bg-surface-hover"><h4 className="text-white font-bold">Skills</h4></div>
                <div className="p-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, idx) => (
                      <span key={idx} className="bg-surface-input border border-surface-border px-3 py-1 rounded-full text-xs text-gray-300 flex items-center">
                        {skill}
                        {isEditing && <button onClick={() => handleArrayRemove('skills', idx)} className="ml-2 text-gray-500 hover:text-red-400"><X size={12} /></button>}
                      </span>
                    ))}
                    {formData.skills.length === 0 && <span className="text-gray-600 text-xs italic">No skills listed.</span>}
                  </div>
                  {isEditing && (
                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-800 mt-2">
                      <input id="add_skills" type="text" className="flex-1 bg-surface-input border border-surface-border rounded p-1 text-sm text-white focus:outline-none" placeholder="Type a skill..." onKeyDown={e => e.key === 'Enter' && handleArrayAdd('skills')}/>
                      <button onClick={() => handleArrayAdd('skills')} className="text-primary hover:text-white"><Plus size={16}/></button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border border-surface-border rounded-lg overflow-hidden bg-bg">
                <div className="border-b border-surface-border p-4 bg-surface-hover"><h4 className="text-white font-bold">Certification</h4></div>
                <div className="p-4 space-y-3">
                  <ul className="space-y-2">
                    {formData.certifications.map((cert, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex justify-between items-start group">
                        <span className="flex items-center"><BadgeCheck size={14} className="text-primary mr-2 shrink-0"/> {cert}</span>
                        {isEditing && <button onClick={() => handleArrayRemove('certifications', idx)} className="text-gray-500 hover:text-red-400 ml-2"><X size={14} /></button>}
                      </li>
                    ))}
                    {formData.certifications.length === 0 && <li className="text-gray-600 text-xs italic">No certifications listed.</li>}
                  </ul>
                  {isEditing && (
                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-800 mt-2">
                      <input id="add_certifications" type="text" className="flex-1 bg-surface-input border border-surface-border rounded p-1 text-sm text-white focus:outline-none" placeholder="Type certification..." onKeyDown={e => e.key === 'Enter' && handleArrayAdd('certifications')}/>
                      <button onClick={() => handleArrayAdd('certifications')} className="text-primary hover:text-white"><Plus size={16}/></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRIVATE INFO TAB */}
        {activeTab === 'Private Info' && (
          <div className="glass-card p-6 max-w-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center"><Landmark className="mr-2 text-primary" size={20}/> Bank Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                <span className="text-gray-500 text-sm">Bank Name</span>
                {isEditing ? <input name="bankName" value={formData.bankName} onChange={handleChange} className="bg-surface-input border border-surface-border rounded px-2 py-1 text-sm text-white focus:outline-none" /> : <div className="text-sm text-gray-300">{formData.bankName || <span className="text-gray-600 italic">Not added</span>}</div>}
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                <span className="text-gray-500 text-sm">Account No.</span>
                {isEditing ? <input name="bankAccountNo" value={formData.bankAccountNo} onChange={handleChange} className="bg-surface-input border border-surface-border rounded px-2 py-1 text-sm text-white focus:outline-none" /> : <div className="text-sm text-gray-300">{formData.bankAccountNo || <span className="text-gray-600 italic">Not added</span>}</div>}
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                <span className="text-gray-500 text-sm">IFSC Code</span>
                {isEditing ? <input name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="bg-surface-input border border-surface-border rounded px-2 py-1 text-sm text-white focus:outline-none" /> : <div className="text-sm text-gray-300">{formData.ifscCode || <span className="text-gray-600 italic">Not added</span>}</div>}
              </div>
            </div>
          </div>
        )}

        {/* SALARY INFO TAB */}
        {activeTab === 'Salary Info' && (
          <div className="glass-card p-6 max-w-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center"><CreditCard className="mr-2 text-primary" size={20}/> Salary Structure</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                <span className="text-gray-500 text-sm">Base Salary</span>
                {isEditing && (user?.role === 'PAYROLL' || user?.role === 'ADMIN') ? (
                  <input name="baseSalary" value={formData.baseSalary} onChange={handleChange} className="bg-surface-input border border-surface-border rounded px-2 py-1 text-sm text-white focus:outline-none" type="number" />
                ) : (
                  <div className="text-sm text-gray-300 font-mono">₹{formData.baseSalary || 0}</div>
                )}
              </div>
              <p className="text-xs text-gray-500 italic mt-4">* Base salary is used to calculate Gross Pay, PF (12%), and Professional Tax during payroll generation.</p>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'Security' && (
          <div className="glass-card p-6 max-w-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center"><Shield className="mr-2 text-primary" size={20}/> Account Security</h3>
            <div className="bg-surface-input border border-surface-border rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Password Management</h4>
              <p className="text-gray-500 text-sm mb-4">Contact your system administrator or use the password reset link on the login page to change your password.</p>
              <button disabled className="px-4 py-2 bg-primary bg-opacity-50 cursor-not-allowed text-white rounded-lg text-sm font-bold">
                Reset Password
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmployeeProfilePage;
