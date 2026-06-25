import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/http.js';

const statusOptions = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'half day', label: 'Half Day' },
  { value: 'leave', label: 'Leave' }
];

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('present');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const navigate = useNavigate();

  const todayKey = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      const response = await api.get('/attendance?personal=true');
      const records = response.data.map((item) => ({ ...item, date: new Date(item.date) }));
      setAttendanceRecords(records);
      const today = records.find((item) => {
        const recordDate = new Date(item.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === todayKey;
      });
      setTodayRecord(today || null);
      if (today?.status) {
        setSelectedStatus(today.status);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [todayKey]);

  const getWeeklyRecords = () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    cutoff.setHours(0, 0, 0, 0);
    return attendanceRecords
      .filter((record) => new Date(record.date).getTime() >= cutoff.getTime())
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleCheckIn = async () => {
    setSaving(true);
    setError('');
    setInfoMessage('');
    try {
      if (!todayRecord) {
        await api.post('/attendance', { status: selectedStatus, checkIn: new Date().toISOString() });
        setInfoMessage('Check-in recorded for today.');
      } else {
        await api.put(`/attendance/${todayRecord._id}`, { checkIn: new Date().toISOString(), status: selectedStatus });
        setInfoMessage('Today attendance updated.');
      }
      loadRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to check in.');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord) {
      setError('Please check in before checking out.');
      return;
    }

    setSaving(true);
    setError('');
    setInfoMessage('');
    try {
      await api.put(`/attendance/${todayRecord._id}`, { checkOut: new Date().toISOString() });
      setInfoMessage('Check-out recorded.');
      loadRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to check out.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Attendance Management</h1>
          <p className="mt-2 text-slate-400">Track your daily and weekly attendance, check in/out, and manage leave status.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="rounded-3xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
        >
          Back to dashboard
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Daily view</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Today&apos;s attendance</h2>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                {todayRecord?.status ? todayRecord.status : 'Not recorded'}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Check In</p>
                <p className="mt-3 text-2xl font-semibold text-white">{formatTime(todayRecord?.checkIn)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Check Out</p>
                <p className="mt-3 text-2xl font-semibold text-white">{formatTime(todayRecord?.checkOut)}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Status</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedStatus(option.value)}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        selectedStatus === option.value
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={saving}
                  className="inline-flex min-w-[10rem] items-center justify-center rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {todayRecord?.checkIn ? 'Update Check In' : 'Check In'}
                </button>
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={saving || !todayRecord?.checkIn}
                  className="inline-flex min-w-[10rem] items-center justify-center rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Check Out
                </button>
              </div>
              {infoMessage && <p className="rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{infoMessage}</p>}
              {error && <p className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Weekly view</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Last 7 days</h2>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                {getWeeklyRecords().length} records
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Check In</th>
                    <th className="px-4 py-3">Check Out</th>
                  </tr>
                </thead>
                <tbody>
                  {getWeeklyRecords().map((record) => (
                    <tr key={record._id} className="border-t border-slate-800 hover:bg-slate-950/50">
                      <td className="px-4 py-4">{formatDate(record.date)}</td>
                      <td className="px-4 py-4 capitalize text-slate-200">{record.status}</td>
                      <td className="px-4 py-4">{formatTime(record.checkIn)}</td>
                      <td className="px-4 py-4">{formatTime(record.checkOut)}</td>
                    </tr>
                  ))}
                  {getWeeklyRecords().length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-sm text-slate-400">
                        No attendance records found for the past week.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Summary</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Attendance status</h2>
            <div className="mt-6 grid gap-4">
              {['present', 'absent', 'half day', 'leave'].map((status) => (
                <div key={status} className="rounded-3xl bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold capitalize text-slate-100">{status}</span>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                      {attendanceRecords.filter((record) => record.status === status).length}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Records with {status} status for the last 30 days.</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Quick links</p>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="rounded-3xl bg-slate-950/90 px-4 py-4 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                View profile details
              </button>
              <button
                type="button"
                onClick={() => navigate('/leaves')}
                className="rounded-3xl bg-slate-950/90 px-4 py-4 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                Review leave requests
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AttendancePage;
