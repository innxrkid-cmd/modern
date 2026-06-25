import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/http.js';

const leaveTypes = [
  { value: 'paid', label: 'Paid Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' }
];

const statusStyles = {
  pending: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  rejected: 'bg-rose-500/10 border-rose-500/20 text-rose-400'
};

function LeavePage() {
  const [leaveType, setLeaveType] = useState('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [requests, setRequests] = useState([]);
  const [employeeRequests, setEmployeeRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('hrms_user') || '{}');
  const isAdmin = user.role === 'admin';

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/leaves?personal=true');
      setRequests(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      if (isAdmin) {
        const allRes = await api.get('/leaves');
        setEmployeeRequests(allRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/leaves/${id}/approve`);
      setInfo('Leave request approved.');
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to approve leave request.');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please enter a reason for rejection (optional):') || 'Rejected by admin';
    try {
      await api.post(`/leaves/${id}/reject`, { rejectionReason: reason });
      setInfo('Leave request rejected.');
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reject leave request.');
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const submitRequest = async (event) => {
    event.preventDefault();
    setSaving(true);
    setInfo('');
    setError('');

    try {
      await api.post('/leaves', {
        leaveType,
        startDate,
        endDate,
        reason: remarks
      });
      setInfo('Leave request submitted successfully.');
      setLeaveType('paid');
      setStartDate('');
      setEndDate('');
      setRemarks('');
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit leave request.');
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    return requests.reduce(
      (acc, req) => {
        acc.total += 1;
        acc[req.status] = (acc[req.status] || 0) + 1;
        acc.types[req.leaveType] = (acc.types[req.leaveType] || 0) + 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0, types: {} }
    );
  }, [requests]);

  const chartItems = useMemo(() => {
    const total = summary.total || 1;
    return [
      { label: 'Approved', value: summary.approved, color: 'from-emerald-500 to-teal-500' },
      { label: 'Pending', value: summary.pending, color: 'from-amber-500 to-orange-500' },
      { label: 'Rejected', value: summary.rejected, color: 'from-rose-500 to-red-500' }
    ].map((item) => ({
      ...item,
      pct: Math.round((item.value / total) * 100)
    }));
  }, [summary]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="relative rounded-[2rem] border border-white/5 bg-[#0F172A]/40 p-6 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden glow-violet">
        <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-tr from-violet-500/10 via-transparent to-blue-500/10 opacity-70 pointer-events-none" />
        
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-400">Time-off Manager</span>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">Leave Planner</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl leading-relaxed">
              Book your holidays, review historical request channels, and manage employee leave approvals.
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="self-start md:self-auto rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 px-5 py-3 text-xs font-bold text-white tracking-wider uppercase transition-all duration-300"
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        
        {/* Left Side: Submit Request */}
        <section className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
          <div className="absolute -inset-px bg-gradient-to-tr from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Form Request</span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-1">Submit Application</h3>
            </div>
            <span className="rounded-full bg-slate-900 border border-white/[0.04] px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {summary.total} Total
            </span>
          </div>

          <form className="mt-8 space-y-6 relative z-10" onSubmit={submitRequest}>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2.5">
                Leave Type
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
              >
                {leaveTypes.map((type) => (
                  <option key={type.value} value={type.value} className="bg-slate-950 text-slate-100 text-xs">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2.5">
                Remarks
              </label>
              <textarea
                rows="4"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Reason for requesting time off..."
                className="w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all resize-none"
              />
            </div>

            <AnimatePresence>
              {info && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-medium text-emerald-400"
                >
                  {info}
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-medium text-rose-400"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider uppercase py-4 px-6 transition duration-300 shadow-lg shadow-indigo-600/10 disabled:opacity-50"
            >
              {saving ? 'Submitting Shift...' : 'Submit Request'}
            </button>
          </form>
        </section>

        {/* Right Side: Overview Cards */}
        <aside className="space-y-6">
          <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
            <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Allowances</span>
            <h3 className="text-lg font-bold text-white tracking-tight mt-1 mb-6">Status Overview</h3>
            
            <div className="grid gap-4">
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Total Applications</p>
                  <p className="mt-1 text-2xl font-black text-white">{summary.total}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-xs font-bold text-slate-400">
                  #
                </div>
              </div>
              
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Approval Rate</p>
                  <p className="mt-1 text-2xl font-black text-emerald-400">
                    {summary.total ? Math.round((summary.approved / summary.total) * 100) : 0}%
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                  %
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
            <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Distributions</span>
            <h3 className="text-lg font-bold text-white tracking-tight mt-1 mb-6">Status Mix</h3>
            
            <div className="space-y-4">
              {chartItems.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">{item.label}</span>
                    <span className="rounded-full bg-slate-900 border border-white/[0.03] px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
                      {item.value}
                    </span>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="mt-3.5 h-1.5 w-full rounded-full bg-white/[0.03] overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${item.color}`} 
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Admin Tab Switching */}
      {isAdmin && (
        <div className="flex gap-2 bg-slate-950/60 border border-white/5 rounded-2xl p-1.5 w-fit relative z-10 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'personal'
                ? 'bg-white/[0.06] border border-white/10 text-white shadow-lg shadow-black/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Your History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('employee')}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'employee'
                ? 'bg-white/[0.06] border border-white/10 text-white shadow-lg shadow-black/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Employee Leaves
          </button>
        </div>
      )}

      {/* Listing Content Tabs */}
      <AnimatePresence mode="wait">
        {activeTab === 'personal' ? (
          <motion.section
            key="personal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Personal Logs</span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1">Leave Requests History</h3>
              </div>
              <span className="rounded-full bg-slate-900 border border-white/[0.04] px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {summary.total} entries
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.05] bg-slate-950/40">
              <table className="min-w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-slate-950/80 text-slate-500">
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Date range</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Remarks</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-xs text-slate-500">Loading history logs...</td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-xs text-slate-500">No time-off requests submitted yet.</td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request._id} className="hover:bg-white/[0.01] transition-all duration-150">
                        <td className="px-6 py-4 font-bold capitalize text-slate-200">{request.leaveType} Leave</td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(request.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} &ndash; {new Date(request.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-slate-400 max-w-[280px] truncate">{request.reason || 'No remarks'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block rounded-full border px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[request.status]}`}>
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="employee"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Company Logs</span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1">Leave applications</h3>
              </div>
              <span className="rounded-full bg-slate-900 border border-white/[0.04] px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {employeeRequests.length} pending list
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.05] bg-slate-950/40">
              <table className="min-w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-slate-950/80 text-slate-500">
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Date range</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Remarks</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-xs text-slate-500">Loading requests directory...</td>
                    </tr>
                  ) : employeeRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-xs text-slate-500">No leave requests found.</td>
                    </tr>
                  ) : (
                    employeeRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-white/[0.01] transition-all duration-150">
                        <td className="px-6 py-4 font-bold text-slate-100">{request.user?.name || 'Unknown User'}</td>
                        <td className="px-6 py-4 capitalize text-slate-300">{request.leaveType}</td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(request.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} &ndash; {new Date(request.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">{request.reason || 'No remarks'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block rounded-full border px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[request.status]}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {request.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleApprove(request._id)}
                                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition-all duration-300"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(request._id)}
                                className="rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition-all duration-300"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">&mdash;</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default LeavePage;
