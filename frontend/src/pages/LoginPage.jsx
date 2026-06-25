import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(148,163,184,0.12),_transparent_25%),#0f172a] px-6 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 overflow-hidden rounded-[2rem] border border-slate-800/80 bg-slate-950/95 shadow-2xl shadow-slate-950/40 lg:flex-row lg:items-center">
        <section className="relative flex-1 bg-slate-900/90 p-10 text-slate-100 sm:p-14 lg:p-16">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-sky-500/5 blur-2xl" />
          <div className="relative z-10">
            <span className="inline-flex rounded-full bg-sky-500/10 px-3 py-1 text-sm font-semibold text-sky-300 ring-1 ring-sky-500/20">
              Modern HRMS
            </span>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Secure human resource management,
              <span className="text-sky-400"> powered by smart workflows.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              Manage employee profiles, attendance, leave requests, and payroll from a single secure system.
              Sign in to get instant access to your HR dashboard and analytics.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-lg shadow-slate-950/10">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Fast login</p>
                <p className="mt-3 text-xl font-semibold text-white">Email and password</p>
              </div>
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-lg shadow-slate-950/10">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Admin ready</p>
                <p className="mt-3 text-xl font-semibold text-white">Role-based access controls</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 p-8 sm:p-10 lg:p-14">
          <div className="mx-auto max-w-md rounded-[2rem] border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/20">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Welcome back</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Sign in to your account</h2>
              <p className="mt-3 text-sm text-slate-400">Enter your employee credentials to continue.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <label className="block text-sm font-medium text-slate-300">
                  Email address
                  <input
                    type="email"
                    placeholder="you@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.4)] transition focus:border-sky-400"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-300">
                  Password
                  <input
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.4)] transition focus:border-sky-400"
                  />
                </label>
              </div>

              {error && (
                <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => navigate('/register')} className="font-semibold text-slate-100 transition hover:text-sky-300">
                Register here
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
