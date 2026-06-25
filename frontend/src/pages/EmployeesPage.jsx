import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/http.js';

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/employees');
        setEmployees(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load employees.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const departmentCounts = useMemo(() => {
    return employees.reduce((acc, emp) => {
      if (!emp.department) return acc;
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {});
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = selectedDept === 'All' || emp.department === selectedDept;
      return matchSearch && matchDept;
    });
  }, [employees, searchTerm, selectedDept]);

  const departments = useMemo(() => {
    return ['All', ...Object.keys(departmentCounts)];
  }, [departmentCounts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Directory Title and summary stats */}
      <div className="relative rounded-[2rem] border border-white/5 bg-[#0F172A]/40 p-6 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden glow-cyan">
        <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-tr from-cyan-500/10 via-transparent to-blue-500/10 opacity-70 pointer-events-none" />
        
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-400">Workforce Directory</span>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">Active Employee Hub</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Browse team records, department distribution profiles, and check direct contact info for all colleagues.
            </p>
          </div>

          <div className="grid gap-3 grid-cols-3">
            <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 text-center min-w-[90px]">
              <p className="text-[10px] uppercase font-bold text-slate-500">Total</p>
              <p className="mt-2 text-2xl font-black text-white">{employees.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 text-center min-w-[90px]">
              <p className="text-[10px] uppercase font-bold text-slate-500">Teams</p>
              <p className="mt-2 text-2xl font-black text-cyan-400">{Object.keys(departmentCounts).length}</p>
            </div>
            <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 text-center min-w-[90px]">
              <p className="text-[10px] uppercase font-bold text-slate-500">Active</p>
              <p className="mt-2 text-2xl font-black text-emerald-400">{employees.filter(e => e.isActive !== false).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Listings Grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        
        {/* Main List */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-[#0F172A]/20 border border-white/5 rounded-3xl p-4 backdrop-blur-md">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-2xl border border-white/5 bg-slate-950/60 pl-4 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
              />
              <span className="absolute right-3.5 top-3 text-[10px] text-slate-600 font-mono">⌘K</span>
            </div>

            {/* Department filters */}
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-thin">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`rounded-full px-4 py-2 text-[10px] font-bold tracking-wide transition border ${
                    selectedDept === dept
                      ? 'bg-slate-950 border-white/10 text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-[#0F172A]/20 backdrop-blur-md overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-900/60 border-b border-slate-900 text-slate-400">
                  <tr>
                    <th className="px-5 py-4 uppercase font-bold tracking-wider">Employee</th>
                    <th className="px-5 py-4 uppercase font-bold tracking-wider">Email Address</th>
                    <th className="px-5 py-4 uppercase font-bold tracking-wider">Job Function</th>
                    <th className="px-5 py-4 uppercase font-bold tracking-wider">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-12 text-center text-slate-500">Loading directory records...</td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-12 text-center text-slate-500">No matching employees found in registry.</td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr key={employee._id} className="border-t border-slate-900 hover:bg-white/[0.01] transition-all">
                        <td className="px-5 py-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/10 flex items-center justify-center font-bold text-[10px]">
                            {employee.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-200">{employee.name}</p>
                            <p className="text-[10px] text-slate-500">{employee.employeeId || 'EMP-000'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 font-mono">{employee.email}</td>
                        <td className="px-5 py-4 capitalize text-slate-300 font-medium">{employee.role}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-900 border border-white/5 px-2.5 py-1 text-[10px] text-slate-300">
                            {employee.department || 'General'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Right Sidebar: department charts */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/5 bg-[#0F172A]/20 p-5 backdrop-blur-md">
            <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Department Mix</span>
            <h3 className="text-sm font-bold text-white mt-1">Personnel count</h3>
            
            <div className="mt-6 space-y-4">
              {Object.entries(departmentCounts).map(([department, count]) => (
                <div key={department} className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>{department}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950/60 border border-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 rounded-full glow-cyan" 
                      style={{ width: `${Math.min(100, Math.round((count / Math.max(1, employees.length)) * 100))}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
          {error}
        </div>
      )}
    </motion.div>
  );
}

export default EmployeesPage;
