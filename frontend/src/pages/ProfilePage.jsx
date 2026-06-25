import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 w-full rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-60 rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse" />
          <div className="h-60 rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 text-rose-200">
        <h3 className="text-lg font-bold">Error Loading Profile</h3>
        <p className="mt-2 text-sm">{error}</p>
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
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-400">My Workspace</span>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">Employee Profile</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl leading-relaxed">
              Verify your structural configurations, review current base salary grades, and manage compliance files.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.1fr]">
        
        {/* Left Side: General Profile Info */}
        <div className="space-y-6">
          
          {/* Card: Personal Details */}
          <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
            <div className="absolute -inset-px bg-gradient-to-tr from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center relative z-10 pb-6 border-b border-white/[0.04]">
              <div className="relative p-0.5 rounded-[1.8rem] bg-gradient-to-tr from-violet-500 to-blue-500 shadow-lg shadow-violet-500/10">
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="h-24 w-24 rounded-[1.7rem] object-cover bg-slate-900 border border-slate-900/50"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Identity Details</span>
                <h3 className="mt-1 text-2xl font-black text-white tracking-tight">{user.name}</h3>
                <p className="mt-1.5 text-xs font-medium text-slate-400">{user.email}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 relative z-10">
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4">
                <span className="text-[9px] uppercase font-bold tracking-[0.20em] text-slate-500">Phone</span>
                <p className="mt-2 text-xs font-bold text-slate-200">{user.phone || 'Not configured'}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4">
                <span className="text-[9px] uppercase font-bold tracking-[0.20em] text-slate-500">Address Location</span>
                <p className="mt-2 text-xs font-bold text-slate-200 truncate">{user.address || 'Not configured'}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4">
                <span className="text-[9px] uppercase font-bold tracking-[0.20em] text-slate-500">Employee ID</span>
                <p className="mt-2 text-xs font-bold text-slate-200 font-mono">{user.employeeId || 'EMP-0000'}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4">
                <span className="text-[9px] uppercase font-bold tracking-[0.20em] text-slate-500">System Status</span>
                <div className="mt-2.5">
                  <span className={`rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${user.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Job details */}
          <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between gap-4 relative z-10 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Assignment details</span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1">{user.title || 'Workforce Employee'}</h3>
              </div>
              <span className="rounded-full bg-slate-900 border border-white/[0.04] px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {user.role}
              </span>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 relative z-10">
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4">
                <span className="text-[9px] uppercase font-bold tracking-[0.20em] text-slate-500">Department</span>
                <p className="mt-2 text-xs font-bold text-slate-200">{user.department || 'General Team'}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4">
                <span className="text-[9px] uppercase font-bold tracking-[0.20em] text-slate-500">Date Joined</span>
                <p className="mt-2 text-xs font-bold text-slate-200">
                  {user.hireDate ? new Date(user.hireDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Financial & Documents */}
        <div className="space-y-6">
          
          {/* Salary details structure */}
          <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
            <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Financial Breakdowns</span>
            <h3 className="text-lg font-bold text-white tracking-tight mt-1 mb-6">Compensation Details</h3>

            <div className="space-y-5 relative z-10">
              <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-slate-500">Base Salary</span>
                <p className="mt-2 text-3xl font-black text-white tracking-tight">{formatCurrency(salaryStructure.baseSalary)}</p>
                <div className="mt-2 h-1 w-12 rounded bg-violet-500/60" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-slate-500 block mb-3">Allowances</span>
                  <div className="space-y-2">
                    {salaryStructure.allowances.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-xs text-slate-300">
                        <span className="text-slate-400 font-medium">{item.label}</span>
                        <span className="font-bold text-emerald-400">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.20em] text-slate-500 block mb-3">Deductions</span>
                  <div className="space-y-2">
                    {salaryStructure.deductions.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-xs text-slate-300">
                        <span className="text-slate-400 font-medium">{item.label}</span>
                        <span className="font-bold text-rose-400">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents card */}
          <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between gap-4 relative z-10 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Verification center</span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1">Compliance Vault</h3>
              </div>
              
              <button 
                type="button" 
                className="rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition-all duration-300"
              >
                Upload
              </button>
            </div>

            <div className="space-y-3 relative z-10">
              {documents.map((doc) => (
                <div key={doc.name} className="rounded-2xl border border-white/[0.04] bg-slate-950/60 px-5 py-4 text-xs text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-slate-200">{doc.name}</span>
                    <span className={`rounded-full border px-3.5 py-1 text-[9px] font-bold uppercase tracking-wider ${doc.status === 'Verified' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default ProfilePage;
