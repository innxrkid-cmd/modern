import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/http.js';

const statusOptions = [
  { value: 'present', label: 'Present', color: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
  { value: 'absent', label: 'Absent', color: 'text-rose-400', glow: 'shadow-rose-500/10' },
  { value: 'half day', label: 'Half Day', color: 'text-amber-400', glow: 'shadow-amber-500/10' },
  { value: 'leave', label: 'Leave', color: 'text-sky-400', glow: 'shadow-sky-500/10' }
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

  const weeklyRecords = useMemo(() => getWeeklyRecords(), [attendanceRecords]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* Title Header */}
      <div className="relative rounded-[2rem] border border-white/5 bg-[#0F172A]/40 p-6 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden glow-blue">
        <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-tr from-blue-500/10 via-transparent to-violet-500/10 opacity-70 pointer-events-none" />
        
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-400">Attendance Hub</span>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">Time & Tracking Logs</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl leading-relaxed">
              Log daily shifts, track check-in and check-out logs, view personal summaries, and schedule leaves.
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
        
        {/* Left Side: Daily & History logs */}
        <div className="space-y-6">
          
          {/* Daily Panel */}
          <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
            <div className="absolute -inset-px bg-gradient-to-tr from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Active Shift</span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1">Today's Checkpoints</h3>
              </div>
              <span className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] border ${
                todayRecord?.status === 'present' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : todayRecord?.status === 'half day'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : todayRecord?.status === 'leave'
                  ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                  : 'bg-slate-900 border-white/[0.04] text-slate-400'
              }`}>
                {todayRecord?.status ? todayRecord.status : 'No Check-In'}
              </span>
            </div>

            {/* Time Slots */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 relative z-10">
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Checked In</span>
                <p className="mt-3 text-3xl font-black text-white tracking-tight">
                  {formatTime(todayRecord?.checkIn)}
                </p>
                <div className="mt-2 h-1 w-12 rounded bg-emerald-500/60" />
              </div>
              
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Checked Out</span>
                <p className="mt-3 text-3xl font-black text-white tracking-tight">
                  {formatTime(todayRecord?.checkOut)}
                </p>
                <div className="mt-2 h-1 w-12 rounded bg-blue-500/60" />
              </div>
            </div>

            {/* Selector status & actions */}
            <div className="mt-8 space-y-6 relative z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Select Attendance Status</span>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {statusOptions.map((option) => {
                    const isSelected = selectedStatus === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedStatus(option.value)}
                        className={`rounded-2xl border p-3.5 text-xs font-bold transition-all duration-300 text-center ${
                          isSelected
                            ? 'bg-white/[0.06] border-white/20 text-white shadow-lg ' + option.glow
                            : 'bg-slate-950/40 border-white/[0.03] text-slate-500 hover:text-slate-300 hover:bg-slate-950/85'
                        }`}
                      >
                        <span className={`block text-xs capitalize ${isSelected ? option.color : ''}`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider uppercase py-4 px-6 transition duration-300 shadow-lg shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {todayRecord?.checkIn ? 'Update Shift Status' : 'Record Check-In'}
                </button>
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={saving || !todayRecord?.checkIn}
                  className="flex-1 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white font-bold text-xs tracking-wider uppercase py-4 px-6 transition duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Confirm Check-Out
                </button>
              </div>

              {/* Message Alerts */}
              <AnimatePresence>
                {infoMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-medium text-emerald-400"
                  >
                    {infoMessage}
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
            </div>
          </div>

          {/* History Panel */}
          <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Timeline Logs</span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1">Weekly History</h3>
              </div>
              <span className="rounded-full bg-slate-900 border border-white/[0.04] px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {weeklyRecords.length} shifts
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.05] bg-slate-950/40">
              <table className="min-w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-slate-950/80 text-slate-500">
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Day</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Check In</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Check Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {weeklyRecords.map((record) => {
                    const matchedStatus = statusOptions.find(o => o.value === record.status);
                    return (
                      <tr key={record._id} className="hover:bg-white/[0.01] transition-all duration-150">
                        <td className="px-6 py-4 font-semibold text-slate-300">{formatDate(record.date)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block font-bold capitalize ${matchedStatus?.color || 'text-slate-400'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{formatTime(record.checkIn)}</td>
                        <td className="px-6 py-4 text-slate-400">{formatTime(record.checkOut)}</td>
                      </tr>
                    );
                  })}
                  {weeklyRecords.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-xs text-slate-500">
                        No shift entries recorded in the last 7 days.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Summaries & Quick Navigation */}
        <div className="space-y-6">
          
          {/* Monthly Aggregation */}
          <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
            <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">30-Day Metrics</span>
            <h3 className="text-lg font-bold text-white tracking-tight mt-1 mb-6">Aggregated Status</h3>
            
            <div className="space-y-4">
              {['present', 'absent', 'half day', 'leave'].map((status) => {
                const count = attendanceRecords.filter((record) => record.status === status).length;
                const total = attendanceRecords.length || 1;
                const percentage = Math.round((count / total) * 100);
                
                let barColor = 'from-violet-500 to-indigo-500';
                let textColor = 'text-slate-300';
                
                if (status === 'present') { barColor = 'from-emerald-500 to-teal-500'; textColor = 'text-emerald-400'; }
                if (status === 'absent') { barColor = 'from-rose-500 to-red-500'; textColor = 'text-rose-400'; }
                if (status === 'half day') { barColor = 'from-amber-500 to-orange-500'; textColor = 'text-amber-400'; }
                if (status === 'leave') { barColor = 'from-sky-500 to-blue-500'; textColor = 'text-sky-400'; }

                return (
                  <div key={status} className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-xs font-bold capitalize ${textColor}`}>{status}</span>
                      <span className="rounded-full bg-slate-900 border border-white/[0.03] px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
                        {count} {count === 1 ? 'shift' : 'shifts'}
                      </span>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="mt-3.5 h-1.5 w-full rounded-full bg-white/[0.03] overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${barColor}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
            <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Shortcuts</span>
            <h3 className="text-lg font-bold text-white tracking-tight mt-1 mb-6">Related Modules</h3>
            
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="group w-full rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 text-left transition hover:border-violet-500/30 hover:bg-slate-950/90 duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white transition">My Profile</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-violet-400 transition-all font-mono">&rarr;</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Check salary tier, contracts, and core documents.</p>
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/leaves')}
                className="group w-full rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 text-left transition hover:border-blue-500/30 hover:bg-slate-950/90 duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white transition">Leave Management</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-blue-400 transition-all font-mono">&rarr;</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Check balance allowances and request dynamic leaves.</p>
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default AttendancePage;
