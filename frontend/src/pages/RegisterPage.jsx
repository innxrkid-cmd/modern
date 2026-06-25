import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/http.js';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setTimeout(() => navigate('/'), 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(148,163,184,0.12),_transparent_25%),#0f172a] px-6 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 overflow-hidden rounded-[2rem] border border-slate-800/80 bg-slate-950/95 shadow-2xl shadow-slate-950/40 lg:flex-row lg:items-center">
        <section className="flex-1 bg-slate-900/90 p-10 sm:p-14 lg:p-16 text-slate-100">
          <span className="inline-flex rounded-full bg-sky-500/10 px-3 py-1 text-sm font-semibold text-sky-300 ring-1 ring-sky-500/20">
            Employee sign-up
          </span>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Create your HR account and start managing your team.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            Complete the registration form to join the HRMS platform. Once registered, you can access attendance, leave management, and payroll features.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-lg shadow-slate-950/10">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Secure</p>
              <p className="mt-3 text-xl font-semibold text-white">Password hashing with bcrypt</p>
            </div>
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-lg shadow-slate-950/10">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Protected</p>
              <p className="mt-3 text-xl font-semibold text-white">JWT token authentication</p>
            </div>
          </div>
        </section>

        <section className="flex-1 p-8 sm:p-10 lg:p-14">
          <div className="mx-auto max-w-md rounded-[2rem] border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/20">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Employee registration</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Join the HRMS platform</h2>
              <p className="mt-3 text-sm text-slate-400">Enter your details to create an employee account.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-300">
                  Full name
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.4)] transition focus:border-sky-400"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-300">
                  Email address
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.4)] transition focus:border-sky-400"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-300">
                  Department
                  <input
                    type="text"
                    placeholder="Human Resources"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.4)] transition focus:border-sky-400"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-300">
                  Job title
                  <input
                    type="text"
                    placeholder="HR Coordinator"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.4)] transition focus:border-sky-400"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-300">
                Password
                <input
                  type="password"
                  placeholder="Create a strong password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.4)] transition focus:border-sky-400"
                />
              </label>

              {error && (
                <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Registering...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-800 pt-5 text-sm text-slate-500">
              <p>
                Already registered?{' '}
                <button type="button" onClick={() => navigate('/')} className="font-semibold text-slate-100 transition hover:text-sky-300">
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RegisterPage;
