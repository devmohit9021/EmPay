import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Check, 
  X, 
  Clock, 
  MessageSquare, 
  AlertCircle,
  ChevronDown,
  Paperclip
} from 'lucide-react';
import leaveService from '../../services/leaveService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LeavePage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  const isAdmin = ['ADMIN', 'HR', 'PAYROLL'].includes(user?.role);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const data = isAdmin 
        ? await leaveService.getAllLeaves()
        : await leaveService.getMyLeaves();
      setLeaves(data);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await leaveService.applyLeave(formData);
      toast.success('Leave application submitted!');
      setShowApplyModal(false);
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'APPROVE') {
        await leaveService.approveLeave(id);
        toast.success('Leave approved');
      } else {
        await leaveService.rejectLeave(id);
        toast.error('Leave rejected');
      }
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to update leave status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'text-green-500 bg-green-500 bg-opacity-10 border-green-500 border-opacity-20';
      case 'REJECTED': return 'text-red-500 bg-red-500 bg-opacity-10 border-red-500 border-opacity-20';
      default: return 'text-primary bg-primary bg-opacity-10 border-primary border-opacity-20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary bg-opacity-20 rounded-xl text-primary">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Leave Management</h2>
            <p className="text-gray-400 text-sm">Request and manage time-off requests</p>
          </div>
        </div>

        {!isAdmin && (
          <button 
            onClick={() => setShowApplyModal(true)}
            className="btn-primary flex items-center space-x-2 px-6 py-3"
          >
            <Plus size={20} />
            <span>Request Leave</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 bg-gradient-to-br from-surface-card to-bg">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Leaves Taken</p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-white">12</h3>
            <div className="h-10 w-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center text-primary">
              <Check size={20} />
            </div>
          </div>
        </div>
        <div className="glass-card p-6 bg-gradient-to-br from-surface-card to-bg">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Pending Requests</p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-white">
              {leaves.filter(l => l.status === 'PENDING').length}
            </h3>
            <div className="h-10 w-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center text-primary">
              <Clock size={20} />
            </div>
          </div>
        </div>
        <div className="glass-card p-6 bg-gradient-to-br from-surface-card to-bg">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Available Balance</p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-green-500">24</h3>
            <div className="h-10 w-10 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center text-green-500">
              <Calendar size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-hover bg-opacity-30">
          <h3 className="font-bold text-white uppercase text-xs tracking-widest">Recent Applications</h3>
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
            <span>Status</span>
            <ChevronDown size={14} />
          </div>
        </div>

        <div className="divide-y divide-surface-border">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="flex justify-center mb-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
              <span>Loading requests...</span>
            </div>
          ) : leaves.length === 0 ? (
            <div className="p-12 text-center text-gray-500 italic">
              No leave applications found.
            </div>
          ) : (
            leaves.map((leave) => (
              <div key={leave.id} className="p-6 hover:bg-surface-hover transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-surface-input border border-surface-border flex flex-col items-center justify-center text-gray-400 group-hover:border-primary group-hover:text-primary transition-all">
                      <span className="text-[10px] font-bold uppercase">{new Date(leave.startDate).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-xl font-bold leading-none">{new Date(leave.startDate).getDate()}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-white font-bold">{leave.type} Leave</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm flex items-center space-x-2">
                        <Calendar size={14} />
                        <span>{new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}</span>
                      </p>
                      {isAdmin && (
                        <p className="text-xs text-primary font-semibold mt-1">Requested by: {leave.employee?.user?.email?.split('@')[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 max-w-md hidden md:block">
                    <div className="flex items-start space-x-2 text-gray-400 italic text-sm">
                      <MessageSquare size={14} className="mt-1 flex-shrink-0" />
                      <p className="line-clamp-2">{leave.reason || 'No reason provided.'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {isAdmin && leave.status === 'PENDING' ? (
                      <>
                        <button 
                          onClick={() => handleAction(leave.id, 'REJECT')}
                          className="p-2 rounded-lg bg-red-500 bg-opacity-10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500 border-opacity-30"
                        >
                          <X size={20} />
                        </button>
                        <button 
                          onClick={() => handleAction(leave.id, 'APPROVE')}
                          className="p-2 rounded-lg bg-green-500 bg-opacity-10 text-green-500 hover:bg-green-500 hover:text-white transition-all border border-green-500 border-opacity-30"
                        >
                          <Check size={20} />
                        </button>
                      </>
                    ) : (
                      <button className="p-2 rounded-lg bg-surface-input border border-surface-border text-gray-500 hover:text-white transition-all">
                        <AlertCircle size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setShowApplyModal(false)}></div>
          <div className="glass-card w-full max-w-lg p-8 relative z-10 animate-scaleIn">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <Calendar className="text-primary" />
              <span>Apply for Leave</span>
            </h3>

            <form onSubmit={handleApply} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="input-field" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="input-field" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Reason / Description</label>
                <textarea 
                  rows="4"
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="input-field resize-none py-3"
                  placeholder="Tell us why you need time off..."
                ></textarea>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-surface-input rounded-xl border border-dashed border-surface-border text-gray-400 hover:text-white cursor-pointer transition-all">
                <Paperclip size={18} />
                <span className="text-sm">Attach documents (e.g. medical certificate)</span>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 py-3"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavePage;
