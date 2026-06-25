import { useEffect, useMemo, useState } from 'react';
import api from '../api/http.js';

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const roleCounts = useMemo(() => {
    return employees.reduce((acc, emp) => {
      acc[emp.role] = (acc[emp.role] || 0) + 1;
      return acc;
    }, {});
  }, [employees]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Workforce</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Employee directory</h1>
            <p className="mt-2 text-sm text-slate-400">Browse your team, department distribution, and role breakdown.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Total</p>
              <p className="mt-3 text-2xl font-semibold text-white">{employees.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Departments</p>
              <p className="mt-3 text-2xl font-semibold text-white">{Object.keys(departmentCounts).length}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Roles</p>
              <p className="mt-3 text-2xl font-semibold text-white">{Object.keys(roleCounts).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_0.75fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Team listing</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Active employees</h2>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-slate-400">Loading employees...</td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-slate-400">No employees found.</td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee._id || employee.id} className="border-t border-slate-800 hover:bg-slate-950/50">
                      <td className="px-4 py-4">{employee.name}</td>
                      <td className="px-4 py-4">{employee.email}</td>
                      <td className="px-4 py-4 capitalize">{employee.role}</td>
                      <td className="px-4 py-4">{employee.department || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Department mix</p>
            <h2 className="mt-2 text-xl font-semibold text-white">People by team</h2>
            <div className="mt-6 space-y-3">
              {Object.entries(departmentCounts).map(([department, count]) => (
                <div key={department} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>{department}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(100, Math.round((count / Math.max(1, employees.length)) * 100))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Roles summary</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Job functions</h2>
            <div className="mt-6 space-y-3">
              {Object.entries(roleCounts).map(([role, count]) => (
                <div key={role} className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
                  <div className="flex items-center justify-between">
                    <span>{role}</span>
                    <span>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {error && <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
    </div>
  );
}

export default EmployeesPage;
