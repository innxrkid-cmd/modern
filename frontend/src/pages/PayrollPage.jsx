import { useEffect, useMemo, useState } from 'react';
import api from '../api/http.js';

const statusStyles = {
  pending: 'bg-amber-500/15 text-amber-300',
  paid: 'bg-emerald-500/15 text-emerald-300',
  failed: 'bg-rose-500/15 text-rose-300'
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
    if (value == null) return '₹0.00';
    return `₹${Number(value).toLocaleString()}`;
  };

  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');

  if (loading) {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-slate-400">Loading payroll data...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Payroll Management</h1>
          <p className="mt-2 text-slate-400">
            {isAdmin
              ? 'Update salary and review all payroll records.'
              : 'View your latest salary details and payment history.'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Payroll overview</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Status summary</h2>
          <div className="mt-6 space-y-3">
            {Object.entries(summary).map(([status, count]) => (
              <div key={status} className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span className="capitalize">{status}</span>
                  <span>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20 xl:col-span-2">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Latest salary</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Current pay period</h2>
          {latestPayroll ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Pay period</p>
                <p className="mt-3 text-lg font-semibold text-white">{formatDate(latestPayroll.payPeriodStart)} - {formatDate(latestPayroll.payPeriodEnd)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Net pay</p>
                <p className="mt-3 text-3xl font-semibold text-emerald-300">{formatCurrency(latestPayroll.netPay)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Base salary</p>
                <p className="mt-3 text-lg font-semibold text-white">{formatCurrency(latestPayroll.baseSalary)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Tax</p>
                <p className="mt-3 text-lg font-semibold text-white">{formatCurrency(latestPayroll.taxAmount)}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-slate-950/80 p-5 text-sm text-slate-400">No payroll record available yet.</div>
          )}
        </div>
      </div>

      {isAdmin ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Admin payroll</p>
                <h2 className="mt-2 text-xl font-semibold text-white">All payroll records</h2>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Net pay</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id} className="border-t border-slate-800 hover:bg-slate-950/50">
                      <td className="px-4 py-4">{record.user?.name || 'Unknown'}</td>
                      <td className="px-4 py-4">{formatDate(record.payPeriodStart)} - {formatDate(record.payPeriodEnd)}</td>
                      <td className="px-4 py-4">{formatCurrency(record.netPay)}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs uppercase ${statusStyles[record.status] || 'bg-slate-700 text-slate-300'}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleEdit(record)}
                          className="rounded-2xl bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                        >
                          Edit salary
                        </button>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-slate-400">No payroll records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {editRecord && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Edit salary</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Update payroll values</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEditRecord(null)}
                  className="rounded-2xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-300">
                  Base salary
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-300">
                  Tax amount
                  <input
                    type="number"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                    className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100"
                  />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={saving}
                  className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditRecord(null)}
                  className="rounded-3xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
              {info && <p className="mt-4 rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{info}</p>}
              {error && <p className="mt-4 rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Employee salary</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Your latest payslip</h2>
          {latestPayroll ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Pay period</p>
                <p className="mt-3 text-lg font-semibold text-white">{formatDate(latestPayroll.payPeriodStart)} - {formatDate(latestPayroll.payPeriodEnd)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Net pay</p>
                <p className="mt-3 text-3xl font-semibold text-emerald-300">{formatCurrency(latestPayroll.netPay)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Base salary</p>
                <p className="mt-3 text-lg font-semibold text-white">{formatCurrency(latestPayroll.baseSalary)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Status</p>
                <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs uppercase ${statusStyles[latestPayroll.status] || 'bg-slate-700 text-slate-300'}`}>
                  {latestPayroll.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-slate-950/80 p-5 text-sm text-slate-400">No payroll records available yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default PayrollPage;
