import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/http.js';

const leaveTypes = [
  { value: 'paid', label: 'Paid Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' }
];

const statusStyles = {
  pending: 'bg-amber-500/15 text-amber-300',
  approved: 'bg-emerald-500/15 text-emerald-300',
  rejected: 'bg-rose-500/15 text-rose-300'
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
      { label: 'Approved', value: summary.approved, color: 'bg-emerald-400' },
      { label: 'Pending', value: summary.pending, color: 'bg-amber-400' },
      { label: 'Rejected', value: summary.rejected, color: 'bg-rose-400' }
    ].map((item) => ({
      ...item,
      pct: Math.round((item.value / total) * 100)
    }));
  }, [summary]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Leave Requests</h1>
          <p className="mt-2 text-slate-400">Submit leave plans and monitor approval status with actionable insights.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="rounded-3xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
        >
          Back to dashboard
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">New request</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Submit leave request</h2>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              {summary.total} total
            </span>
          </div>

          <form className="mt-6 space-y-5" onSubmit={submitRequest}>
            <label className="block text-sm font-medium text-slate-300">
              Leave type
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100"
              >
                {leaveTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-300">
                Start date
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100"
                />
              </label>
              <label className="block text-sm font-medium text-slate-300">
                End date
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-300">
              Remarks
              <textarea
                rows="4"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100"
              />
            </label>

            {info && <div className="rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{info}</div>}
            {error && <div className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Submitting...' : 'Submit request'}
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Request status</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Overview</h2>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Total requests</span>
                  <span>{summary.total}</span>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Approval rate</span>
                  <span>{summary.total ? Math.round((summary.approved / summary.total) * 100) : 0}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Status mix</p>
            <div className="mt-6 space-y-3">
              {chartItems.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {isAdmin && (
        <div className="flex gap-4 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`pb-2 text-sm font-semibold tracking-wide transition ${
              activeTab === 'personal' ? 'border-b-2 border-sky-500 text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Your Leave History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('employee')}
            className={`pb-2 text-sm font-semibold tracking-wide transition ${
              activeTab === 'employee' ? 'border-b-2 border-sky-500 text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Employee Leave Requests
          </button>
        </div>
      )}

      {activeTab === 'personal' ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Recent requests</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Your latest leave history</h2>
            </div>
            <div className="rounded-3xl bg-slate-950/80 px-4 py-2 text-sm text-slate-300">
              {summary.total} requests total
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date range</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-slate-400">Loading requests...</td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-slate-400">No leave requests submitted yet.</td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request._id} className="border-t border-slate-800 hover:bg-slate-950/50">
                      <td className="px-4 py-4 capitalize text-slate-100">{request.leaveType}</td>
                      <td className="px-4 py-4 text-slate-300">{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-slate-300">{request.reason || 'No remarks'}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs uppercase ${statusStyles[request.status]}`}>
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Employee Requests</p>
              <h2 className="mt-2 text-xl font-semibold text-white">All employee leave applications</h2>
            </div>
            <div className="rounded-3xl bg-slate-950/80 px-4 py-2 text-sm text-slate-300">
              {employeeRequests.length} requests total
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date range</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-slate-400">Loading requests...</td>
                  </tr>
                ) : employeeRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-slate-400">No leave requests found.</td>
                  </tr>
                ) : (
                  employeeRequests.map((request) => (
                    <tr key={request._id} className="border-t border-slate-800 hover:bg-slate-950/50">
                      <td className="px-4 py-4 text-slate-100 font-medium">{request.user?.name || 'Unknown'}</td>
                      <td className="px-4 py-4 capitalize text-slate-300">{request.leaveType}</td>
                      <td className="px-4 py-4 text-slate-300">{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-slate-300">{request.reason || 'No remarks'}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs uppercase ${statusStyles[request.status]}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {request.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(request._id)}
                              className="rounded-2xl bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(request._id)}
                              className="rounded-2xl bg-rose-500 px-3 py-1 text-xs font-semibold text-slate-950 transition hover:bg-rose-400"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default LeavePage;
