import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Employees', to: '/employees' },
  { label: 'Attendance', to: '/attendance' },
  { label: 'Leave', to: '/leave' },
  { label: 'Payroll', to: '/payroll' }
];

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthRoute = location.pathname === '/' || location.pathname === '/register';

  const user = JSON.parse(localStorage.getItem('hrms_user') || '{}');
  const isAdmin = user.role === 'admin';

  const filteredNavItems = navItems.filter((item) => {
    if (item.to === '/employees' && !isAdmin) return false;
    return true;
  });

  const handleLogout = () => {
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('hrms_user');
    navigate('/');
  };

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="border-b border-slate-800 bg-slate-900/95">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-300">Modern HRMS</p>
                <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Modern SaaS HR dashboard</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-800 bg-slate-950/95 px-6 py-8">
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/20">HR</div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Modern HRMS</p>
                <p className="text-xs text-slate-500">SaaS dashboard</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-3xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-slate-800 text-white shadow-lg shadow-slate-950/20' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-10 space-y-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-slate-950/20">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Workspace</p>
            <div className="space-y-3">
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="text-sm text-slate-400">Employees</p>
                <p className="mt-2 text-lg font-semibold text-white">20+</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="text-sm text-slate-400">Updated</p>
                <p className="mt-2 text-lg font-semibold text-white">Real-time</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex flex-col">
          <header className="border-b border-slate-800 bg-slate-900/95 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
                <p className="mt-1 text-sm text-slate-400">Modern HR insights, analytics, and workforce actions.</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                Sign out
              </button>
            </div>
          </header>

          <main className="flex-1 px-6 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
