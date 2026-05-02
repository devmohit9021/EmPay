import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  Check,
  Hash,
  Loader2,
  Shield,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STEPS = ['Company', 'Admin Account', 'Done'];

const SetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = company info, 1 = admin account, 2 = done
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    companyCode: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  });

  // Check if system is already set up
  useEffect(() => {
    const checkSetup = async () => {
      // Clear any stale auth token first — fresh setup should be clean
      localStorage.removeItem('empay_token');
      try {
        const res = await api.get('/auth/check-setup');
        if (res.data.data.isSetup) {
          toast('System already set up. Please log in.', { icon: 'ℹ️' });
          navigate('/login');
        }
      } catch {
        // If endpoint unreachable, allow setup to proceed
      } finally {
        setChecking(false);
      }
    };
    checkSetup();
  }, []);

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 0) {
      if (!form.companyName.trim()) { toast.error('Company name is required'); return; }
      if (!/^[A-Za-z]{2}$/.test(form.companyCode)) { toast.error('Company code must be exactly 2 letters'); return; }
      setStep(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.adminPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/setup', {
        companyName: form.companyName.trim(),
        companyCode: form.companyCode.toUpperCase(),
        adminName: form.adminName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
      });

      // Auto-login the admin
      const { token, user } = res.data.data;
      localStorage.setItem('empay_token', token);
      toast.success(`Welcome, ${user.name}! Your company is ready.`);
      setStep(2);

      // Small delay then go to dashboard
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] bg-primary opacity-10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] bg-primary opacity-10 blur-[120px] rounded-full" />

      <div className="w-full max-w-lg p-6 relative z-10">
        <div className="glass-card p-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center font-bold text-white text-3xl mb-5 shadow-lg shadow-primary/30">E</div>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome to EmPay</h1>
            <p className="text-gray-400 text-sm text-center">Set up your company to get started</p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center mb-10 space-x-3">
            {STEPS.map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i < step ? 'bg-green-500 text-white' :
                    i === step ? 'bg-primary text-white shadow-md shadow-primary/40' :
                    'bg-surface-input border border-surface-border text-gray-500'
                  }`}>
                    {i < step ? <Check size={16} /> : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 font-semibold uppercase tracking-wider ${i === step ? 'text-primary' : 'text-gray-600'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-12 mb-4 transition-all ${i < step ? 'bg-green-500' : 'bg-surface-border'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 0: Company Details */}
          {step === 0 && (
            <form onSubmit={handleNext} className="space-y-5">
              <div className="flex items-center space-x-3 mb-6 p-4 bg-primary bg-opacity-10 rounded-xl border border-primary border-opacity-20">
                <Building2 className="text-primary flex-shrink-0" size={20} />
                <p className="text-sm text-gray-300">
                  Start by registering your company. You'll become the <span className="text-primary font-bold">Admin</span> of this workspace.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Company Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={set('companyName')}
                    className="input-field pl-10"
                    placeholder="e.g. Orbis Innovations Pvt. Ltd."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Company Code <span className="text-gray-500 font-normal">(2 letters, used in Employee IDs)</span></label>
                <div className="relative group">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="text"
                    maxLength={2}
                    value={form.companyCode}
                    onChange={(e) => setForm({ ...form, companyCode: e.target.value.toUpperCase().replace(/[^A-Z]/gi, '') })}
                    className="input-field pl-10 uppercase font-mono font-bold tracking-widest text-center text-lg"
                    placeholder="OI"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Employee IDs will look like: <span className="text-primary font-mono font-bold">{form.companyCode || 'OI'}JDOE20240001</span>
                </p>
              </div>

              <button type="submit" className="btn-primary w-full flex items-center justify-center space-x-2 py-3 mt-2">
                <span>Next: Create Admin Account</span>
                <ChevronRight size={18} />
              </button>
            </form>
          )}

          {/* Step 1: Admin Account */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center space-x-3 mb-6 p-4 bg-primary bg-opacity-10 rounded-xl border border-primary border-opacity-20">
                <Shield className="text-primary flex-shrink-0" size={20} />
                <p className="text-sm text-gray-300">
                  Create your <span className="text-primary font-bold">Administrator</span> account for <span className="font-bold text-white">{form.companyName}</span>.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input type="text" value={form.adminName} onChange={set('adminName')} className="input-field pl-10" placeholder="John Doe" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input type="email" value={form.adminEmail} onChange={set('adminEmail')} className="input-field pl-10" placeholder="admin@company.com" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input type="password" value={form.adminPassword} onChange={set('adminPassword')} className="input-field pl-10" placeholder="••••••••" minLength={8} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Confirm</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} className="input-field pl-10" placeholder="••••••••" required />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-2 flex-1 flex items-center justify-center space-x-2 py-3">
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span>Create Company</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Done */}
          {step === 2 && (
            <div className="flex flex-col items-center space-y-6 py-4">
              <div className="h-20 w-20 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                <Check className="text-green-500" size={40} />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">All Set! 🎉</h2>
                <p className="text-gray-400 text-sm">
                  <span className="text-white font-semibold">{form.companyName}</span> is ready.<br />
                  Redirecting you to the dashboard…
                </p>
              </div>
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {step < 2 && (
            <div className="mt-6 text-center text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
