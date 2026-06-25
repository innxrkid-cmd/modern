import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/http.js';

const statusStyles = {
  pending: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  paid: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  failed: 'bg-rose-500/10 border-rose-500/20 text-rose-400'
};

function PayrollPage() {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [editRecord, setEditRecord] = useState(null);
  const [baseSalary, setBaseSalary] = useState('');
  const [taxAmount, setTaxAmount] = useState('');

  const loadPayroll = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const [userRes, payrollRes] = await Promise.all([api.get('/users/me'), api.get('/payroll')]);
      setUser(userRes.data);
      setRecords(payrollRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load payroll records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, []);

  const isAdmin = user?.role === 'admin';
  const latestPayroll = useMemo(() => {
    if (!records.length) return null;
    return records.slice().sort((a, b) => new Date(b.payPeriodEnd) - new Date(a.payPeriodEnd))[0];
  }, [records]);

  const summary = useMemo(() => {
    return records.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      },
      { pending: 0, paid: 0, failed: 0 }
    );
  }, [records]);

  const handleEdit = (record) => {
    setEditRecord(record);
    setBaseSalary(record.baseSalary || '');
    setTaxAmount(record.taxAmount || '');
    setError('');
    setInfo('');
  };

  const handleUpdate = async () => {
    if (!editRecord) return;
    setSaving(true);
    setError('');
    setInfo('');
    try {
      await api.put(`/payroll/${editRecord._id}`, {
        baseSalary: Number(baseSalary),
        taxAmount: Number(taxAmount)
      });
      setInfo('Payroll record updated successfully.');
      setEditRecord(null);
      loadPayroll();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update payroll record.');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) => {
    if (value == null) return '$0.00';
    return `$${Number(value).toLocaleString()}`;
  };

  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');

  const handlePayAll = async () => {
    setSaving(true);
    setError('');
    setInfo('');
    try {
      const res = await api.post('/payroll/pay-all');
      setInfo(res.data.message || 'All pending payrolls processed successfully.');
      loadPayroll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process all payrolls.');
    } finally {
      setSaving(false);
    }
  };

  const handlePayIndividual = async (id) => {
    setSaving(true);
    setError('');
    setInfo('');
    try {
      await api.post(`/payroll/${id}/pay`);
      setInfo('Payroll processed successfully.');
      loadPayroll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payroll.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 w-full rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-40 rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse" />
          <div className="h-40 rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse xl:col-span-2" />
        </div>
      </div>
    );
  }

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
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-400">Finance Control</span>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">Payroll & Compensation</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl leading-relaxed">
              {isAdmin
                ? 'Update company salary tiers, manage contractor records, and monitor payslip dispatch.'
                : 'Monitor monthly pay periods, download digital slips, and review historical payouts.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left Side: Status summary */}
        <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
          <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Summary</span>
          <h3 className="text-lg font-bold text-white tracking-tight mt-1 mb-6">Status Overview</h3>
          
          <div className="space-y-4">
            {Object.entries(summary).map(([status, count]) => {
              const total = records.length || 1;
              const percentage = Math.round((count / total) * 100);
              
              let barColor = 'from-violet-500 to-indigo-500';
              let textColor = 'text-slate-300';
              
              if (status === 'paid') { barColor = 'from-emerald-500 to-teal-500'; textColor = 'text-emerald-400'; }
              if (status === 'failed') { barColor = 'from-rose-500 to-red-500'; textColor = 'text-rose-400'; }
              if (status === 'pending') { barColor = 'from-amber-500 to-orange-500'; textColor = 'text-amber-400'; }

              return (
                <div key={status} className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs font-bold capitalize ${textColor}`}>{status}</span>
                    <span className="rounded-full bg-slate-900 border border-white/[0.03] px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
                      {count} {count === 1 ? 'record' : 'records'}
                    </span>
                  </div>
                  
                  {/* Progress Line */}
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

        {/* Right Side: Latest payslip preview */}
        <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl xl:col-span-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Active payslip</span>
          <h3 className="text-lg font-bold text-white tracking-tight mt-1 mb-6">Current Pay Period</h3>
          
          {latestPayroll ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-slate-500">Pay Period</span>
                <p className="mt-3 text-sm font-semibold text-slate-200">
                  {formatDate(latestPayroll.payPeriodStart)} &ndash; {formatDate(latestPayroll.payPeriodEnd)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-slate-500">Net Pay Outflow</span>
                <p className="mt-3 text-3xl font-black text-emerald-400 tracking-tight">
                  {formatCurrency(latestPayroll.netPay)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-slate-500">Base Salary</span>
                <p className="mt-3 text-sm font-semibold text-slate-200">
                  {formatCurrency(latestPayroll.baseSalary)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-slate-500">Withholding Tax</span>
                <p className="mt-3 text-sm font-semibold text-slate-200">
                  {formatCurrency(latestPayroll.taxAmount)}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-6 text-center text-xs text-slate-500">
              No active payroll logs dispatched yet.
            </div>
          )}
        </div>
      </div>

      {isAdmin ? (
        <div className="space-y-6">
          {/* Admin records list */}
          <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Manager Dashboard</span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1">All Payroll Ledger Logs</h3>
              </div>
              <button
                type="button"
                onClick={handlePayAll}
                disabled={saving || !records.some(r => r.status === 'pending')}
                className="self-start sm:self-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99]"
              >
                Process All Pending
              </button>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-slate-950/40">
              <table className="min-w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-slate-950/80 text-slate-500">
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Net pay</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-white/[0.01] transition-all duration-150">
                      <td className="px-6 py-4 font-bold text-slate-100">{record.user?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(record.payPeriodStart)} &ndash; {formatDate(record.payPeriodEnd)}</td>
                      <td className="px-6 py-4 font-bold text-slate-200">{formatCurrency(record.netPay)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full border px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[record.status] || 'bg-slate-700 text-slate-300'}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {record.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handlePayIndividual(record._id)}
                              disabled={saving}
                              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-all duration-300 disabled:opacity-50 shadow-md shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99]"
                            >
                              Give Payroll
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleEdit(record)}
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                          >
                            Edit Salary
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-xs text-slate-500">No payroll records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <AnimatePresence>
            {!editRecord && (info || error) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-2xl border p-4 text-xs font-medium ${
                  info ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                {info || error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inline Editor Draw Panel */}
          <AnimatePresence>
            {editRecord && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl"
              >
                <div className="absolute -inset-px bg-gradient-to-tr from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                
                <div className="flex items-center justify-between gap-4 relative z-10 border-b border-white/[0.04] pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Modification Channel</span>
                    <h3 className="text-lg font-bold text-white tracking-tight mt-1">Update payroll values for {editRecord.user?.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditRecord(null)}
                    className="rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] px-4 py-2.5 text-xs font-bold text-slate-300 transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
                
                <div className="mt-8 grid gap-4 sm:grid-cols-2 relative z-10">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2.5">
                      Base Salary ($)
                    </label>
                    <input
                      type="number"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(e.target.value)}
                      className="w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2.5">
                      Tax Amount ($)
                    </label>
                    <input
                      type="number"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                      className="w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex flex-wrap gap-3 relative z-10">
                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={saving}
                    className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300"
                  >
                    Save configuration
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRecord(null)}
                    className="rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 transition-all duration-300"
                  >
                    Close
                  </button>
                </div>

                <AnimatePresence>
                  {info && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-medium text-emerald-400"
                    >
                      {info}
                    </motion.div>
                  )}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-medium text-rose-400"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Employee custom payslip detail view */
        <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
          <div className="absolute -inset-px bg-gradient-to-tr from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
          
          <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Detailed Statement</span>
          <h3 className="text-lg font-bold text-white tracking-tight mt-1 mb-6">Digital Payslip Voucher</h3>
          
          {latestPayroll ? (
            <div className="grid gap-6 sm:grid-cols-2 relative z-10">
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-slate-500">Statement Period</span>
                  <p className="mt-2 text-sm font-semibold text-slate-300">
                    {formatDate(latestPayroll.payPeriodStart)} &ndash; {formatDate(latestPayroll.payPeriodEnd)}
                  </p>
                </div>
                
                <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-slate-500">Gross Base Salary</span>
                  <p className="mt-2 text-sm font-semibold text-slate-300">
                    {formatCurrency(latestPayroll.baseSalary)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-slate-500">Deposit Status</span>
                  <div className="mt-3.5">
                    <span className={`inline-block rounded-full border px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[latestPayroll.status] || 'bg-slate-700 text-slate-300'}`}>
                      {latestPayroll.status}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-slate-500">Direct Deposited Net Amount</span>
                  <p className="mt-2 text-2xl font-black text-emerald-400 tracking-tight">
                    {formatCurrency(latestPayroll.netPay)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-6 text-center text-xs text-slate-500 relative z-10">
              No statement histories found for this user context.
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default PayrollPage;
