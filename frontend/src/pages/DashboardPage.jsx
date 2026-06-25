import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/http.js';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChartTab, setActiveChartTab] = useState('growth');
  const navigate = useNavigate();

  const statusCounts = useMemo(() => {
    return attendance.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      },
      { present: 0, absent: 0, leave: 0, remote: 0 }
    );
  }, [attendance]);

  const summaryStats = useMemo(() => {
    const total = attendance.length;
    const present = statusCounts.present;
    const attendanceRate = total ? Math.round((present / total) * 100) : 0;
    const approvedLeaves = leaves.filter((item) => item.status === 'approved').length;
    const pendingLeaves = leaves.filter((item) => item.status === 'pending').length;
    const payrollPending = payrolls.filter((item) => item.status === 'pending').length;

    return {
      employeeCount: employees.length,
      attendanceRate,
      approvedLeaves,
      pendingLeaves,
      payrollPending
    };
  }, [attendance, employees.length, leaves, payrolls, statusCounts]);

  const chartItems = useMemo(() => {
    const total = attendance.length || 1;
    return [
      { label: 'Present', value: statusCounts.present, color: 'bg-emerald-400' },
      { label: 'Absent', value: statusCounts.absent, color: 'bg-rose-400' },
      { label: 'On leave', value: statusCounts.leave, color: 'bg-amber-400' },
      { label: 'Remote', value: statusCounts.remote, color: 'bg-sky-400' }
    ].map((item) => ({
      ...item,
      pct: Math.round((item.value / total) * 100)
    }));
  }, [attendance.length, statusCounts]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const userRes = await api.get('/users/me');
      const currentUser = userRes.data;
      setUser(currentUser);

      const isAdminUser = currentUser.role === 'admin';

      const promises = [
        api.get('/attendance'),
        api.get('/leaves'),
        api.get('/payroll')
      ];

      if (isAdminUser) {
        promises.push(api.get('/users'));
      }

      const results = await Promise.all(promises);

      setAttendance(results[0].data);
      setLeaves(results[1].data);
      setPayrolls(results[2].data);

      if (isAdminUser) {
        setEmployees(results[3].data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 w-full rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-40 rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse" />
          <div className="h-40 rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse" />
          <div className="h-40 rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-200">
        <h3 className="text-lg font-bold">Error Loading Dashboard</h3>
        <p className="mt-2 text-sm">{error}</p>
        <button onClick={fetchData} className="mt-4 rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-slate-950">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Hero Grid */}
      <div className="relative rounded-[2rem] border border-white/5 bg-[#0F172A]/40 p-6 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden glow-violet">
        <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-tr from-violet-500/10 via-transparent to-blue-500/10 opacity-70 pointer-events-none" />
        
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-400">
              {isAdmin ? 'System Control Panel' : 'Employee Portal'}
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
              {isAdmin ? 'SaaS Executive Analytics' : `Welcome Back, ${user.name}`}
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              {isAdmin
                ? 'Review company headcount metrics, verify leaves, process payroll and predict employee churn trends.'
                : 'Monitor your check-in logs, submit leave plans, and review your payroll slips instantly.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isAdmin && (
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 text-center min-w-[110px]">
                <p className="text-[10px] uppercase font-bold text-slate-500">Employees</p>
                <p className="mt-2 text-2xl font-black text-white">{summaryStats.employeeCount}</p>
              </div>
            )}
            <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-500">Attendance Rate</p>
              <p className="mt-2 text-2xl font-black text-emerald-400">{summaryStats.attendanceRate}%</p>
            </div>
            <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-500">Pending Leave</p>
              <p className="mt-2 text-2xl font-black text-amber-400">{summaryStats.pendingLeaves}</p>
            </div>
            <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-500">Payroll Due</p>
              <p className="mt-2 text-2xl font-black text-blue-400">{summaryStats.payrollPending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid gap-6 xl:grid-cols-12">
        
        {/* Left Content Area: Charts & Main Metrics */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Glass Chart Card */}
          <div className="rounded-[2rem] border border-white/5 bg-[#0F172A]/20 p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-tr from-violet-500/5 via-transparent to-blue-500/5 opacity-50" />
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6 relative z-10">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Analytics Panel</span>
                <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                  {isAdmin ? 'Workforce Dynamics' : 'Personal Activity Tracker'}
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveChartTab('growth')}
                  className={`rounded-full px-3.5 py-1.5 text-[10px] font-semibold transition ${
                    activeChartTab === 'growth' ? 'bg-slate-900 border border-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {isAdmin ? 'Growth' : 'Activity'}
                </button>
                <button
                  onClick={() => setActiveChartTab('ratio')}
                  className={`rounded-full px-3.5 py-1.5 text-[10px] font-semibold transition ${
                    activeChartTab === 'ratio' ? 'bg-slate-900 border border-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Distribution
                </button>
              </div>
            </div>

            <div className="h-48 w-full flex items-center justify-center relative z-10">
              <AnimatePresence mode="wait">
                {activeChartTab === 'growth' ? (
                  <motion.div
                    key="growth"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full h-full relative"
                  >
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 0 90 C 20 80 30 50 60 40 T 100 20 L 100 100 L 0 100 Z" fill="url(#grow-grad-dash)" />
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="grow-grad-dash" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <motion.path
                        d="M 0 90 C 20 80 30 50 60 40 T 100 20"
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="3.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2 }}
                      />
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ratio"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-end gap-6 justify-center w-full h-36"
                  >
                    {chartItems.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${item.pct}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.05 }}
                          className={`w-10 rounded-t-xl ${item.color} shadow-lg`}
                          style={{ maxHeight: '110px', minWidth: '40px' }}
                        />
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{item.label}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* AI Workforce Analytics & Insights */}
          <div className="rounded-[2rem] border border-white/5 bg-[#0F172A]/20 p-6 backdrop-blur-md relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-violet-400">Dayflow AI Insight</span>
            <h3 className="text-base font-bold text-white tracking-tight mt-1">Smart System Diagnostics</h3>
            <div className="mt-4 flex gap-4 items-start">
              <div className="h-10 w-10 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-lg shadow-inner">🤖</div>
              <div className="text-xs space-y-2 leading-relaxed text-slate-400">
                {isAdmin ? (
                  <p>
                    Workforce health index is currently stable at <strong className="text-white">96%</strong>. System analysis detects high fatigue levels in the <span className="text-violet-300">Engineering</span> team due to consecutive overnight deployments. Suggesting automated schedule rotation options to rebalance shift priorities.
                  </p>
                ) : (
                  <p>
                    You have <strong className="text-white">5 days</strong> of accrued paid leave remaining for this quarter. To optimize productivity indexes and prevent fatigue buildup, consider scheduling a short holiday in mid-July.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area: Action Panels & Lists */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="rounded-[2rem] border border-white/5 bg-[#0F172A]/20 p-6 backdrop-blur-md shadow-xl">
            <p className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Quick Actions</p>
            <h3 className="text-base font-bold text-white tracking-tight mt-1">Navigate HR Tools</h3>
            
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => navigate('/attendance')}
                className="w-full rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 px-4 py-3.5 text-left text-xs font-semibold text-slate-200 transition-all hover:bg-white/[0.06] active:scale-[0.98]"
              >
                Track Attendance Log
              </button>
              <button
                type="button"
                onClick={() => navigate('/leave')}
                className="w-full rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 px-4 py-3.5 text-left text-xs font-semibold text-slate-200 transition-all hover:bg-white/[0.06] active:scale-[0.98]"
              >
                Manage Leave Requests
              </button>
              <button
                type="button"
                onClick={() => navigate('/payroll')}
                className="w-full rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 px-4 py-3.5 text-left text-xs font-semibold text-slate-200 transition-all hover:bg-white/[0.06] active:scale-[0.98]"
              >
                Review Salary & Payslips
              </button>
            </div>
          </div>

          {/* Timeline Activity widget */}
          <div className="rounded-[2rem] border border-white/5 bg-[#0F172A]/20 p-6 backdrop-blur-md shadow-xl">
            <p className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Activity Timeline</p>
            <h3 className="text-base font-bold text-white tracking-tight mt-1">Recent Actions</h3>
            
            <div className="mt-6 space-y-4 text-xs">
              {[
                { time: '10 mins ago', label: 'Check-in recorded', detail: 'Employee ID EMP001 logged' },
                { time: '1 hour ago', label: 'Leave request approved', detail: 'Vacation request for Noah Patel' },
                { time: 'Yesterday', label: 'Payroll payroll run', detail: 'Disbursal generated for June cycle' }
              ].map((act, i) => (
                <div key={i} className="flex gap-3 relative pb-2 border-l border-slate-900 pl-4 ml-2">
                  <div className="absolute top-1.5 -left-1 w-2.5 h-2.5 rounded-full bg-violet-500 border-2 border-[#020617]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{act.label}</span>
                      <span className="text-[9px] text-slate-600">{act.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{act.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
