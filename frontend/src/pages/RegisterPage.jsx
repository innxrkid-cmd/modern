import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/http.js';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const TITLES = ['Software Engineer', 'HR Specialist', 'Sales Executive', 'Marketing Coordinator', 'Finance Analyst', 'Operations Manager'];

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
        title,
        department
      });

      setSuccess('Registration successful. You can now sign in.');
      setName('');
      setEmail('');
      setPassword('');
      setTitle('');
      setDepartment('');
      setTimeout(() => navigate('/login'), 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative rounded-[2rem] border border-white/5 bg-[#0F172A]/40 p-8 md:p-10 shadow-2xl backdrop-blur-xl overflow-hidden glow-blue">
        <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-tr from-blue-500/10 via-transparent to-violet-500/10 opacity-70 pointer-events-none" />
        
        <div className="mb-8 text-center sm:text-left">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-400">Join the platform</span>
          <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">Create your account</h2>
          <p className="mt-2 text-xs text-slate-400">Complete the form to set up your employee credentials.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Full Name
              <input
                type="text"
                placeholder="Jane Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
              />
            </label>

            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Email Address
              <input
                type="email"
                placeholder="jane@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Department
              <div className="relative mt-2">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 pr-10 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-[#0F172A] text-slate-500">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="bg-[#0F172A] text-slate-100">
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </label>

            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Job Title
              <div className="relative mt-2">
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 pr-10 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-[#0F172A] text-slate-500">Select Job Title</option>
                  {TITLES.map((t) => (
                    <option key={t} value={t} className="bg-[#0F172A] text-slate-100">
                      {t}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </label>
          </div>

          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Password
            <div className="relative mt-2">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-slate-950/60 pl-4 pr-12 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300"
            >
              {success}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-900 pt-5 text-center text-xs text-slate-500">
          Already registered?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-bold text-blue-400 hover:text-blue-300 transition"
          >
            Sign in here
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default RegisterPage;
