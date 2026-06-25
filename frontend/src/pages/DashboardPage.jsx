import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/http.js';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    return <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 text-slate-400">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-rose-200">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
              {isAdmin ? 'Executive summary' : 'Personal summary'}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              {isAdmin ? 'SaaS HR analytics' : `Welcome back, ${user.name}`}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              {isAdmin
                ? 'See workforce health, attendance trends, leave activity, and payroll priorities from a single dashboard.'
                : 'Track your work status, pending leaves, and payroll records directly from your personal dashboard.'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {isAdmin && (
              <div className="rounded-3xl bg-slate-950/80 p-5 shadow-inner shadow-slate-950/10">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Employees</p>
                <p className="mt-3 text-3xl font-semibold text-white">{summaryStats.employeeCount}</p>
              </div>
            )}
            <div className="rounded-3xl bg-slate-950/80 p-5 shadow-inner shadow-slate-950/10">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Attendance rate</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summaryStats.attendanceRate}%</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-5 shadow-inner shadow-slate-950/10">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Pending leave</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summaryStats.pendingLeaves}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-5 shadow-inner shadow-slate-950/10">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Payroll due</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summaryStats.payrollPending}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${isAdmin ? 'xl:grid-cols-[1.25fr_0.9fr]' : 'grid-cols-1'}`}>
        <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                {isAdmin ? 'Attendance distribution' : 'Your work breakdown'}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {isAdmin ? 'Work status breakdown' : 'Personal status breakdown'}
              </h2>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">Last 30 days</span>
          </div>

          <div className="space-y-4">
            {chartItems.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{item.label}</span>
                  <span>{item.value} ({item.pct}%)</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800">
                  <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {isAdmin && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active employees</p>
                <p className="mt-3 text-2xl font-semibold text-white">{employees.filter((item) => item.isActive).length}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">On leave</p>
                <p className="mt-3 text-2xl font-semibold text-white">{summaryStats.approvedLeaves}</p>
              </div>
            </div>
          )}
        </section>

        {isAdmin && (
          <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Team insight</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Latest employee activity</h2>
            </div>

            <div className="rounded-3xl bg-slate-950/80 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Recent check-ins</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{attendance.filter((item) => item.status === 'present').length}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Open requests</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{summaryStats.pendingLeaves}</p>
                </div>
              </div>
              <div className="mt-4 rounded-3xl bg-slate-900/80 p-4">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Payroll outstanding</p>
                <p className="mt-3 text-3xl font-semibold text-white">{summaryStats.payrollPending}</p>
              </div>
            </div>
          </section>
        )}
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Profile summary</p>
              <h2 className="mt-2 text-xl font-semibold text-white">{user.name}</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/80 p-4">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Department</p>
              <p className="mt-2 text-lg font-semibold text-white">{user.department || 'General'}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-4">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Title</p>
              <p className="mt-2 text-lg font-semibold text-white">{user.title || 'Employee'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Take action</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Navigate your HR tools</h2>
          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="w-full rounded-3xl bg-sky-500 px-4 py-4 text-left text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Track attendance
            </button>
            <button
              type="button"
              onClick={() => navigate('/leave')}
              className="w-full rounded-3xl bg-slate-950/80 px-4 py-4 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Manage leave requests
            </button>
            <button
              type="button"
              onClick={() => navigate('/payroll')}
              className="w-full rounded-3xl bg-slate-950/80 px-4 py-4 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Review payroll
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
