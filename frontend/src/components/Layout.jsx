import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/http.js';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Employees', to: '/employees' },
  { label: 'Attendance', to: '/attendance' },
  { label: 'Leave', to: '/leave' },
  { label: 'Payroll', to: '/payroll' },
  { label: 'Announcements', to: '/announcements' }
];

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  const user = JSON.parse(localStorage.getItem('hrms_user') || '{}');
  const isAdmin = user.role === 'admin';

  const [teamSize, setTeamSize] = useState(0);

  useEffect(() => {
    if (!isAuthRoute && localStorage.getItem('hrms_token')) {
      api.get('/employees/count')
        .then((res) => {
          setTeamSize(res.data.count);
        })
        .catch((err) => {
          console.error('Failed to fetch employee count:', err);
        });
    }
  }, [isAuthRoute, location.pathname]);

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
      <div className="min-h-screen bg-[#020617] text-slate-100 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[160px] pointer-events-none" />
        
        <header className="border-b border-slate-900 bg-[#0F172A]/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/10">
                  <span className="text-xs font-black text-white">D</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-400">Dayflow</p>
                  <h1 className="text-sm font-semibold text-white tracking-tight">Workforce Management</h1>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1 flex items-center justify-center relative z-10">
          <Outlet />
        </main>
        
        <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900/60 bg-slate-950/20">
          © {new Date().getFullYear()} Dayflow Inc. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[160px] pointer-events-none" />
      
      <div className="grid min-h-screen w-full grid-cols-1 xl:grid-cols-[280px_1fr]">
        
        {/* Sidebar */}
        <aside className="border-r border-slate-900 bg-[#0F172A]/30 backdrop-blur-xl px-6 py-8 flex flex-col justify-between hidden xl:flex">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-blue-500 text-white font-black shadow-lg shadow-violet-500/20">D</div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-white">Dayflow</p>
                <span className="text-[10px] text-slate-500 font-mono">v1.0.0</span>
              </div>
            </div>

            <nav className="space-y-1.5">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-xs font-semibold tracking-wide transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-violet-600/20 to-blue-600/10 border border-violet-500/20 text-white shadow-md shadow-violet-950/10' 
                        : 'text-slate-400 border border-transparent hover:bg-white/[0.02] hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-md">
            <p className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Workspace</p>
            <div className="space-y-2">
              <div className="rounded-2xl bg-slate-950/40 border border-white/[0.04] p-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Team Size</span>
                <span className="font-semibold text-white">{teamSize}</span>
              </div>
              <div className="rounded-2xl bg-slate-950/40 border border-white/[0.04] p-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Database</span>
                <span className="font-semibold text-emerald-400">Active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <div className="flex flex-col min-h-screen">
          <header className="border-b border-slate-900 bg-[#0F172A]/20 backdrop-blur-md px-8 py-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Dayflow HRMS</span>
              <h1 className="text-lg font-bold text-white tracking-tight capitalize mt-0.5">
                {location.pathname.substring(1) || 'Workspace'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{user?.name || 'HR Admin'}</p>
                <p className="text-[9px] uppercase tracking-wider text-slate-500 font-medium">{user?.role || 'Guest'}</p>
              </div>
              
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] px-4 py-2 text-xs font-semibold text-slate-200 transition-all active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </header>

          <main className="flex-1 px-8 py-8 overflow-y-auto">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
        
      </div>
    </div>
  );
}

export default Layout;
