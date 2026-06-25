import { useEffect, useState } from 'react';
import api from '../api/http.js';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const profilePicture = user?.profilePicture || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80';

  const salaryStructure = user?.salary || {
    baseSalary: 65000,
    allowances: [
      { label: 'Housing', amount: 8000 },
      { label: 'Transport', amount: 3500 },
      { label: 'Mobile', amount: 1200 }
    ],
    deductions: [
      { label: 'Tax', amount: 9500 },
      { label: 'Insurance', amount: 1700 }
    ]
  };

  const documents = user?.documents || [
    { name: 'Employment Letter', status: 'Verified' },
    { name: 'ID Proof', status: 'Pending' },
    { name: 'Signed NDA', status: 'Verified' }
  ];

  const formatCurrency = (value) => `₹${value?.toLocaleString()}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Employee Profile</h1>
          <p className="mt-2 text-slate-400">Review your personal details, compensation summary, and document status.</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-400">Loading profile...</div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-200">{error}</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="h-24 w-24 rounded-3xl object-cover border border-slate-700"
                />
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Personal Information</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{user.name}</h2>
                  <p className="mt-2 text-sm text-slate-400">{user.email}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Phone</p>
                  <p className="mt-2 text-sm text-slate-100">{user.phone || 'Not provided'}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Address</p>
                  <p className="mt-2 text-sm text-slate-100">{user.address || 'Not provided'}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Employee ID</p>
                  <p className="mt-2 text-sm text-slate-100">{user.employeeId || 'EMP-0000'}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
                  <p className="mt-2 text-sm text-slate-100">{user.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Job Information</p>
                  <h2 className="mt-3 text-xl font-semibold text-white">{user.title || 'Employee'}</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                  {user.role}
                </span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Department</p>
                  <p className="mt-2 text-sm text-slate-100">{user.department || 'General'}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Joined</p>
                  <p className="mt-2 text-sm text-slate-100">{user.hireDate ? new Date(user.hireDate).toLocaleDateString() : 'TBD'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Salary structure</p>
              <h2 className="mt-3 text-xl font-semibold text-white">Compensation breakdown</h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Base salary</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(salaryStructure.baseSalary)}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Allowances</p>
                    <div className="mt-3 space-y-2">
                      {salaryStructure.allowances.map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm text-slate-200">
                          <span>{item.label}</span>
                          <span>{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-950/80 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Deductions</p>
                    <div className="mt-3 space-y-2">
                      {salaryStructure.deductions.map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm text-slate-200">
                          <span>{item.label}</span>
                          <span>{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Documents</p>
                  <h2 className="mt-3 text-xl font-semibold text-white">Important files</h2>
                </div>
                <button type="button" className="rounded-2xl bg-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300 transition hover:bg-slate-700">
                  Upload
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {documents.map((doc) => (
                  <div key={doc.name} className="rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-4 text-sm text-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <span>{doc.name}</span>
                      <span className={`rounded-full px-3 py-1 text-xs uppercase ${doc.status === 'Verified' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
