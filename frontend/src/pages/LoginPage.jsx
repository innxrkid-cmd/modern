import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/http.js';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('hrms_token', token);
      localStorage.setItem('hrms_user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="relative rounded-[2rem] border border-white/5 bg-[#0F172A]/40 p-8 md:p-10 shadow-2xl backdrop-blur-xl overflow-hidden glow-violet">
        <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-tr from-violet-500/10 via-transparent to-blue-500/10 opacity-70 pointer-events-none" />
        
        <div className="mb-8 text-center sm:text-left">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-400">Welcome Back</span>
          <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">Sign in to Dayflow</h2>
          <p className="mt-2 text-xs text-slate-400">Enter your employee credentials to access your dashboard.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Email Address
              <input
                type="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
              />
            </label>

            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Password
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
              />
            </label>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-900 pt-5 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="font-bold text-violet-400 hover:text-violet-300 transition"
          >
            Register here
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default LoginPage;
