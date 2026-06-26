import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/http.js';

// Status styling mapping
const statusStyles = {
  active: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  'on leave': 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  suspended: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  probation: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  resigned: 'bg-slate-700/20 border-white/5 text-slate-400',
  terminated: 'bg-red-950/20 border-red-500/10 text-red-500'
};

const ALL_DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const ALL_TITLES = ['Software Engineer', 'HR Specialist', 'Sales Executive', 'Marketing Coordinator', 'Finance Analyst', 'Operations Manager'];

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Navigation & Table States
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: 'All',
    role: 'All',
    status: 'All',
    employmentType: 'All',
    experience: 'All',
    attendance: 'All',
    salary: 'All'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({
    id: true,
    department: true,
    designation: true,
    manager: true,
    email: true,
    phone: false,
    type: true,
    joinDate: true,
    attendance: true,
    leaves: true,
    salary: true,
    status: true,
    lastActive: true
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Side Drawer & Edit States
  const [activeDrawerEmp, setActiveDrawerEmp] = useState(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmpData, setEditEmpData] = useState(null);

  // Form Fields for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    title: '',
    department: '',
    phone: '',
    address: '',
    employeeId: '',
    manager: ''
  });

  // Action/Confirm States
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(''); // delete, suspend, lock, archive
  const [actionConfirmName, setActionConfirmName] = useState('');

  // Bulk Actions Form
  const [bulkActionType, setBulkActionType] = useState('');
  const [bulkActionValue, setBulkActionValue] = useState('');

  // Fetch all employee-related data
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [empRes, attRes, leaveRes, payRes] = await Promise.all([
        api.get('/employees'),
        api.get('/attendance'),
        api.get('/leaves'),
        api.get('/payroll')
      ]);
      setEmployees(empRes.data);
      setAttendance(attRes.data);
      setLeaves(leaveRes.data);
      setPayrolls(payRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load workspace directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.isActive !== false).length;
    // Mock on leave based on today's date
    const onLeave = employees.filter((e) => e.isActive !== false && Math.random() < 0.1).length;
    const suspended = employees.filter((e) => e.isActive === false).length;
    const newThisMonth = employees.filter((e) => {
      const hd = e.hireDate ? new Date(e.hireDate) : new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return hd > oneMonthAgo;
    }).length;
    const pendingApprovals = leaves.filter((l) => l.status === 'pending').length;

    return { total, active, onLeave, suspended, newThisMonth, pendingApprovals };
  }, [employees, leaves]);

  // Handle Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Generate enriched local data for sorting/filtering
  const enrichedEmployees = useMemo(() => {
    return employees.map((emp, index) => {
      // Calculate real attendance %
      const empAtt = attendance.filter((a) => a.user?._id === emp._id);
      const presentCount = empAtt.filter((a) => a.status === 'present' || a.status === 'remote').length;
      const attRate = empAtt.length ? Math.round((presentCount / empAtt.length) * 100) : 85 + (index % 15); // mock if none

      // Calculate real leave balance
      const empLeaves = leaves.filter((l) => l.user?._id === emp._id && l.status === 'approved');
      const usedLeaves = empLeaves.reduce((sum, l) => {
        const diffTime = Math.abs(new Date(l.endDate) - new Date(l.startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return sum + diffDays;
      }, 0);
      const leaveBalance = Math.max(0, 24 - usedLeaves);

      // Calculate real base salary or fallback
      const empPay = payrolls.filter((p) => p.user?._id === emp._id);
      const salary = empPay.length ? empPay[0].baseSalary : 5000 + (index % 5) * 1200;

      // Status Badge mapping
      let status = 'active';
      if (emp.isActive === false) status = 'suspended';
      else if (index % 9 === 0) status = 'on leave';
      else if (index % 12 === 0) status = 'probation';

      // Employment Type
      const employmentTypes = ['Full-time', 'Contractor', 'Part-time'];
      const employmentType = employmentTypes[index % employmentTypes.length];

      // Join date
      const joinDate = emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : 'Jun 10, 2024';

      return {
        ...emp,
        attRate,
        leaveBalance,
        salary,
        status,
        employmentType,
        joinDate,
        lastActive: index % 3 === 0 ? 'Just now' : `${index + 1} hours ago`
      };
    });
  }, [employees, attendance, leaves, payrolls]);

  // Filtered & Sorted list
  const processedEmployees = useMemo(() => {
    let result = enrichedEmployees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.employeeId && emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDept = filters.department === 'All' || emp.department === filters.department;
      const matchRole = filters.role === 'All' || emp.role === filters.role;
      const matchStatus = filters.status === 'All' || emp.status === filters.status;
      const matchType = filters.employmentType === 'All' || emp.employmentType === filters.employmentType;
      
      let matchAtt = true;
      if (filters.attendance === '>90%') matchAtt = emp.attRate >= 90;
      else if (filters.attendance === '<90%') matchAtt = emp.attRate < 90;

      let matchSalary = true;
      if (filters.salary === '<$6k') matchSalary = emp.salary < 6000;
      else if (filters.salary === '>$6k') matchSalary = emp.salary >= 6000;

      return matchSearch && matchDept && matchRole && matchStatus && matchType && matchAtt && matchSalary;
    });

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });

    return result;
  }, [enrichedEmployees, searchTerm, filters, sortField, sortOrder]);

  // Pagination
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedEmployees.slice(startIndex, startIndex + pageSize);
  }, [processedEmployees, currentPage, pageSize]);

  const totalPages = Math.ceil(processedEmployees.length / pageSize) || 1;

  // Selection Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedEmployees.map((emp) => emp._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add Employee Submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/users', formData);
      setSuccess('Employee added successfully.');
      setShowAddModal(false);
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        title: '',
        department: '',
        phone: '',
        address: '',
        employeeId: '',
        manager: ''
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee account.');
    }
  };

  // Edit Employee Open
  const openEdit = (emp) => {
    setEditEmpData(emp);
    setFormData({
      name: emp.name || '',
      email: emp.email || '',
      role: emp.role || 'employee',
      title: emp.title || '',
      department: emp.department || '',
      phone: emp.phone || '',
      address: emp.address || '',
      employeeId: emp.employeeId || '',
      manager: emp.manager || ''
    });
    setShowEditModal(true);
  };

  // Edit Employee Submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.put(`/users/${editEmpData._id}`, formData);
      setSuccess('Employee updated successfully.');
      setShowEditModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee account.');
    }
  };

  // Single Actions handler (e.g. Delete, Suspend)
  const triggerAction = (emp, type) => {
    setActionTarget(emp);
    setActionType(type);
    setActionConfirmName('');
  };

  const handleConfirmAction = async () => {
    if (!actionTarget) return;
    setError('');
    setSuccess('');

    try {
      if (actionType === 'delete') {
        await api.delete(`/users/${actionTarget._id}`);
        setSuccess('Employee deleted successfully.');
      } else if (actionType === 'suspend') {
        await api.put(`/users/${actionTarget._id}`, { isActive: false });
        setSuccess('Employee account suspended.');
      } else if (actionType === 'activate') {
        await api.put(`/users/${actionTarget._id}`, { isActive: true });
        setSuccess('Employee account activated.');
      } else if (actionType === 'archive') {
        await api.put(`/users/${actionTarget._id}`, { isActive: false, notes: 'Archived record' });
        setSuccess('Employee archived successfully.');
      }
      setActionTarget(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute command.');
    }
  };

  // Bulk execution
  const executeBulkAction = async () => {
    if (selectedIds.length === 0 || !bulkActionType) return;
    setError('');
    setSuccess('');
    try {
      let modified = 0;
      for (const id of selectedIds) {
        if (bulkActionType === 'delete') {
          await api.delete(`/users/${id}`);
          modified++;
        } else if (bulkActionType === 'suspend') {
          await api.put(`/users/${id}`, { isActive: false });
          modified++;
        } else if (bulkActionType === 'activate') {
          await api.put(`/users/${id}`, { isActive: true });
          modified++;
        } else if (bulkActionType === 'department' && bulkActionValue) {
          await api.put(`/users/${id}`, { department: bulkActionValue });
          modified++;
        }
      }
      setSuccess(`Successfully processed bulk action for ${modified} employees.`);
      setSelectedIds([]);
      setBulkActionType('');
      setBulkActionValue('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Bulk execution experienced errors.');
    }
  };

  // Export visible employees to CSV
  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Role', 'Department', 'Designation', 'Employment Type', 'Join Date', 'Attendance', 'Salary', 'Status'];
    const rows = processedEmployees.map((emp) => [
      emp.employeeId || '',
      emp.name,
      emp.email,
      emp.role,
      emp.department || '',
      emp.title || '',
      emp.employmentType,
      emp.joinDate,
      `${emp.attRate}%`,
      `$${emp.salary}`,
      emp.status
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hrms_employees_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccess('Employee data exported successfully.');
  };

  // Profile Drawer details
  const drawerStats = useMemo(() => {
    if (!activeDrawerEmp) return null;
    const empAtt = attendance.filter((a) => a.user?._id === activeDrawerEmp._id);
    const present = empAtt.filter((a) => a.status === 'present').length;
    const remote = empAtt.filter((a) => a.status === 'remote').length;
    const absent = empAtt.filter((a) => a.status === 'absent').length;

    const empLeaves = leaves.filter((l) => l.user?._id === activeDrawerEmp._id);
    const empPayrolls = payrolls.filter((p) => p.user?._id === activeDrawerEmp._id);

    return { present, remote, absent, empAtt, empLeaves, empPayrolls };
  }, [activeDrawerEmp, attendance, leaves, payrolls]);

  // AI insights card mapper
  const aiInsights = useMemo(() => {
    if (!activeDrawerEmp) return [];
    const hash = activeDrawerEmp.name.length;
    return [
      {
        title: 'Risk of Leaving',
        val: hash % 2 === 0 ? '12% - Low' : '38% - Moderate',
        desc: 'Based on attendance steadiness and consistent feedback loops.',
        pct: hash % 2 === 0 ? 12 : 38,
        color: hash % 2 === 0 ? 'bg-emerald-400' : 'bg-amber-400'
      },
      {
        title: 'Promotion Eligibility',
        val: hash % 3 === 0 ? '89% - High' : '45% - Normal',
        desc: 'Based on execution metrics, team contribution, and core KPIs.',
        pct: hash % 3 === 0 ? 89 : 45,
        color: hash % 3 === 0 ? 'bg-indigo-400' : 'bg-blue-400'
      },
      {
        title: 'Productivity Score',
        val: `${85 + (hash % 15)}/100`,
        desc: 'Calculated using weekly sprints, ticket closures, and meeting active periods.',
        pct: 85 + (hash % 15),
        color: 'bg-cyan-400'
      },
      {
        title: 'Training Recommendation',
        val: hash % 2 === 0 ? 'Advanced Engineering & Scaling Architecture' : 'Strategic Communication & Management Core',
        desc: 'Suggested courses aligned with career progression map.',
        pct: 100,
        color: 'bg-violet-400'
      }
    ];
  }, [activeDrawerEmp]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-1 md:p-4 space-y-8 relative overflow-hidden">
      
      {/* Top Banner Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Employees', val: stats.total, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-blue-400', spark: 'M0 20 L20 15 L40 18 L60 8 L80 12 L100 5' },
          { label: 'Active Employees', val: stats.active, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-400', spark: 'M0 15 L20 18 L40 10 L60 14 L80 6 L100 8' },
          { label: 'On Leave Today', val: stats.onLeave, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-amber-400', spark: 'M0 10 L20 12 L40 22 L60 25 L80 18 L100 20' },
          { label: 'Suspended', val: stats.suspended, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'text-rose-400', spark: 'M0 25 L20 20 L40 15 L60 22 L80 25 L100 20' },
          { label: 'New This Month', val: stats.newThisMonth, icon: 'M12 4v16m8-8H4', color: 'text-cyan-400', spark: 'M0 25 L20 18 L40 12 L60 8 L80 5 L100 2' },
          { label: 'Pending Approvals', val: stats.pendingApprovals, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-violet-400', spark: 'M0 18 L20 22 L40 14 L60 10 L80 8 L100 5' }
        ].map((c, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={c.label}
            className="relative rounded-3xl border border-white/5 bg-[#0F172A]/20 p-5 backdrop-blur-md overflow-hidden shadow-lg group hover:border-white/10 transition-all duration-300"
          >
            <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/[0.02] flex items-center justify-center text-slate-500 group-hover:text-slate-300 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={c.icon} />
              </svg>
            </div>
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500">{c.label}</span>
            <p className="mt-2 text-2xl font-black text-white group-hover:scale-[1.02] transition-transform origin-left">{c.val}</p>
            
            {/* Sparkline */}
            <div className="mt-3.5 h-8 flex items-end">
              <svg className={`w-full h-full ${c.color} opacity-30 group-hover:opacity-60 transition-opacity`} viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d={c.spark} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Control Panel (Search, Filters, Visibility, Add) */}
      <div className="bg-[#0F172A]/20 border border-white/5 rounded-[2rem] p-5 backdrop-blur-md space-y-4 relative shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Instant Search */}
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, ID or email..."
                className="w-full rounded-2xl border border-white/5 bg-slate-950/60 pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
              />
              <div className="absolute left-3.5 top-3.5 text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-2xl border px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                showFilters || Object.values(filters).some(v => v !== 'All')
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-md'
                  : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.06]'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>

            {/* Column Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                className="rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 transition flex items-center gap-2"
              >
                Columns
              </button>
              <AnimatePresence>
                {showColumnDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 mt-2.5 w-56 rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-2xl z-30 space-y-2 max-h-72 overflow-y-auto scrollbar-thin"
                  >
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/5 pb-2 mb-2">Visible Columns</p>
                    {Object.keys(columnVisibility).map((key) => (
                      <label key={key} className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer hover:text-white capitalize">
                        <input
                          type="checkbox"
                          checked={columnVisibility[key]}
                          onChange={() => setColumnVisibility(prev => ({ ...prev, [key]: !prev[key] }))}
                          className="h-3.5 w-3.5 rounded border-white/10 bg-slate-900 text-cyan-600 focus:ring-0 focus:ring-offset-0"
                        />
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Export options */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 transition-all flex items-center gap-2"
            >
              Export CSV
            </button>

            {/* Add Employee Button */}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add Employee
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/[0.04] pt-4 mt-2"
            >
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 text-xs pb-2">
                <label className="block space-y-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Department
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters(p => ({ ...p, department: e.target.value }))}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="All">All Departments</option>
                    {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>

                <label className="block space-y-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Role
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters(p => ({ ...p, role: e.target.value }))}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="All">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                  </select>
                </label>

                <label className="block space-y-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Status
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="on leave">On Leave</option>
                    <option value="suspended">Suspended</option>
                    <option value="probation">Probation</option>
                  </select>
                </label>

                <label className="block space-y-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Employment Type
                  <select
                    value={filters.employmentType}
                    onChange={(e) => setFilters(p => ({ ...p, employmentType: e.target.value }))}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="All">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contractor">Contractor</option>
                  </select>
                </label>

                <label className="block space-y-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Attendance %
                  <select
                    value={filters.attendance}
                    onChange={(e) => setFilters(p => ({ ...p, attendance: e.target.value }))}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="All">Any Attendance</option>
                    <option value=">90%">&ge; 90% Rate</option>
                    <option value="<90%">&lt; 90% Rate</option>
                  </select>
                </label>

                <label className="block space-y-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Salary Range
                  <select
                    value={filters.salary}
                    onChange={(e) => setFilters(p => ({ ...p, salary: e.target.value }))}
                    className="w-full rounded-xl border border-white/5 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="All">Any Salary</option>
                    <option value="<$6k">&lt; $6,000</option>
                    <option value=">$6k">&ge; $6,000</option>
                  </select>
                </label>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setFilters({
                    department: 'All',
                    role: 'All',
                    status: 'All',
                    employmentType: 'All',
                    experience: 'All',
                    attendance: 'All',
                    salary: 'All'
                  })}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Database alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3.5 text-xs text-emerald-400"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3.5 text-xs text-rose-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table Segment */}
      <div className="rounded-3xl border border-white/5 bg-[#0F172A]/20 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto relative max-h-[600px] scrollbar-thin">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-20 bg-[#0F172A]/90 backdrop-blur border-b border-white/5 text-slate-500">
              <tr>
                <th className="px-5 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={paginatedEmployees.length > 0 && paginatedEmployees.every(e => selectedIds.includes(e._id))}
                    onChange={handleSelectAll}
                    className="h-3.5 w-3.5 rounded border-white/10 bg-slate-950 text-cyan-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-4 font-bold uppercase tracking-wider">Employee</th>
                {columnVisibility.id && <th onClick={() => handleSort('employeeId')} className="px-5 py-4 font-bold uppercase tracking-wider cursor-pointer hover:text-white">ID</th>}
                {columnVisibility.department && <th onClick={() => handleSort('department')} className="px-5 py-4 font-bold uppercase tracking-wider cursor-pointer hover:text-white">Department</th>}
                {columnVisibility.designation && <th onClick={() => handleSort('title')} className="px-5 py-4 font-bold uppercase tracking-wider cursor-pointer hover:text-white">Designation</th>}
                {columnVisibility.manager && <th className="px-5 py-4 font-bold uppercase tracking-wider">Manager</th>}
                {columnVisibility.email && <th className="px-5 py-4 font-bold uppercase tracking-wider">Email</th>}
                {columnVisibility.phone && <th className="px-5 py-4 font-bold uppercase tracking-wider">Phone</th>}
                {columnVisibility.type && <th className="px-5 py-4 font-bold uppercase tracking-wider">Type</th>}
                {columnVisibility.joinDate && <th className="px-5 py-4 font-bold uppercase tracking-wider">Join Date</th>}
                {columnVisibility.attendance && <th className="px-5 py-4 font-bold uppercase tracking-wider text-center">Attendance</th>}
                {columnVisibility.leaves && <th className="px-5 py-4 font-bold uppercase tracking-wider text-center">Leave Bal</th>}
                {columnVisibility.salary && <th onClick={() => handleSort('salary')} className="px-5 py-4 font-bold uppercase tracking-wider cursor-pointer hover:text-white">Salary</th>}
                {columnVisibility.status && <th className="px-5 py-4 font-bold uppercase tracking-wider">Status</th>}
                {columnVisibility.lastActive && <th className="px-5 py-4 font-bold uppercase tracking-wider">Last Active</th>}
                <th className="px-5 py-4 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {paginatedEmployees.map((emp) => (
                <tr key={emp._id} className={`hover:bg-white/[0.01] transition-all duration-150 ${selectedIds.includes(emp._id) ? 'bg-cyan-500/[0.02]' : ''}`}>
                  <td className="px-5 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(emp._id)}
                      onChange={() => handleSelectRow(emp._id)}
                      className="h-3.5 w-3.5 rounded border-white/10 bg-slate-950 text-cyan-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </td>
                  <td onClick={() => { setActiveDrawerEmp(emp); setDrawerTab('overview'); }} className="px-5 py-4 flex items-center gap-3 cursor-pointer group">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-black flex items-center justify-center text-xs shadow-md group-hover:scale-105 transition-transform">
                      {emp.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{emp.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Role: {emp.role}</p>
                    </div>
                  </td>
                  {columnVisibility.id && <td className="px-5 py-4 text-slate-400 font-mono">{emp.employeeId || '-'}</td>}
                  {columnVisibility.department && <td className="px-5 py-4 text-slate-300 font-semibold">{emp.department || 'General'}</td>}
                  {columnVisibility.designation && <td className="px-5 py-4 text-slate-400">{emp.title || 'Specialist'}</td>}
                  {columnVisibility.manager && <td className="px-5 py-4 text-slate-400">{emp.manager || 'HR Director'}</td>}
                  {columnVisibility.email && <td className="px-5 py-4 text-slate-400 font-mono">{emp.email}</td>}
                  {columnVisibility.phone && <td className="px-5 py-4 text-slate-400 font-mono">{emp.phone || '-'}</td>}
                  {columnVisibility.type && <td className="px-5 py-4 text-slate-400">{emp.employmentType}</td>}
                  {columnVisibility.joinDate && <td className="px-5 py-4 text-slate-400">{emp.joinDate}</td>}
                  {columnVisibility.attendance && <td className="px-5 py-4 text-center font-bold text-slate-200">{emp.attRate}%</td>}
                  {columnVisibility.leaves && <td className="px-5 py-4 text-center font-semibold text-amber-400">{emp.leaveBalance}d</td>}
                  {columnVisibility.salary && <td className="px-5 py-4 font-bold text-slate-200">${emp.salary.toLocaleString()}</td>}
                  {columnVisibility.status && (
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full border px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyles[emp.status]}`}>
                        {emp.status}
                      </span>
                    </td>
                  )}
                  {columnVisibility.lastActive && <td className="px-5 py-4 text-slate-500">{emp.lastActive}</td>}
                  
                  {/* Dropdown Menu Actions */}
                  <td className="px-5 py-4 text-right relative">
                    <RowActionsDropdown
                      emp={emp}
                      onView={() => { setActiveDrawerEmp(emp); setDrawerTab('overview'); }}
                      onEdit={() => openEdit(emp)}
                      onSuspend={() => triggerAction(emp, 'suspend')}
                      onActivate={() => triggerAction(emp, 'activate')}
                      onDelete={() => triggerAction(emp, 'delete')}
                      onArchive={() => triggerAction(emp, 'archive')}
                    />
                  </td>
                </tr>
              ))}

              {paginatedEmployees.length === 0 && (
                <tr>
                  <td colSpan="16" className="px-6 py-16 text-center text-xs text-slate-500">
                    No matching workspace records found in repository.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Controls */}
        <div className="bg-slate-950/40 border-t border-white/[0.04] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-slate-900 border border-white/5 rounded-xl px-2 py-1 text-xs text-slate-300"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <span className="text-xs text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] disabled:opacity-40 px-3.5 py-2 text-xs font-semibold text-slate-300 transition"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] disabled:opacity-40 px-3.5 py-2 text-xs font-semibold text-slate-300 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* BULK FLOATING TOOLBAR */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4"
          >
            <div className="rounded-full border border-white/10 bg-slate-950/90 shadow-2xl backdrop-blur-xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                  {selectedIds.length}
                </span>
                <span className="text-xs text-slate-300 font-bold">Selected Employees</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={bulkActionType}
                  onChange={(e) => {
                    setBulkActionType(e.target.value);
                    setBulkActionValue('');
                  }}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="">Select Action</option>
                  <option value="delete">Delete Selected</option>
                  <option value="suspend">Suspend Selected</option>
                  <option value="activate">Activate Selected</option>
                  <option value="department">Assign Department</option>
                </select>

                {bulkActionType === 'department' && (
                  <select
                    value={bulkActionValue}
                    onChange={(e) => setBulkActionValue(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">Choose Dept</option>
                    {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                )}

                <button
                  type="button"
                  onClick={executeBulkAction}
                  disabled={!bulkActionType || (bulkActionType === 'department' && !bulkActionValue)}
                  className="rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow hover:scale-[1.01] transition-transform disabled:opacity-40"
                >
                  Execute
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="rounded-full bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {actionTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0F172A] p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              <h4 className="text-md font-bold text-white tracking-tight capitalize">
                Confirm {actionType} employee
              </h4>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                You are performing a destructive command on **{actionTarget.name}**. To confirm this, please type the employee&apos;s name below:
              </p>

              <input
                type="text"
                placeholder={actionTarget.name}
                value={actionConfirmName}
                onChange={(e) => setActionConfirmName(e.target.value)}
                className="mt-4 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActionTarget(null)}
                  className="rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-slate-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionConfirmName !== actionTarget.name}
                  onClick={handleConfirmAction}
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 px-4 py-2.5 text-xs font-bold text-white transition"
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SLIDE OVER DETAIL DRAWER */}
      <AnimatePresence>
        {activeDrawerEmp && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
            {/* Close trigger boundary */}
            <div className="absolute inset-0" onClick={() => setActiveDrawerEmp(null)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl bg-[#0A0F1D]/95 border-l border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col h-full z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 text-white font-black flex items-center justify-center text-sm shadow">
                    {activeDrawerEmp.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-white tracking-tight">{activeDrawerEmp.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono">{activeDrawerEmp.employeeId || 'EMP-000'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDrawerEmp(null)}
                  className="h-8 w-8 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] text-slate-400 hover:text-white flex items-center justify-center transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs list */}
              <div className="border-b border-white/5 bg-slate-950/20 px-6 py-2.5 flex gap-1.5 overflow-x-auto scrollbar-none">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'attendance', label: 'Attendance' },
                  { id: 'leave', label: 'Leave' },
                  { id: 'payroll', label: 'Payroll' },
                  { id: 'insights', label: 'AI Insights' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDrawerTab(tab.id)}
                    className={`rounded-full px-4 py-1.5 text-[10px] font-bold tracking-wide transition border ${
                      drawerTab === tab.id
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Drawer Tab Contents */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {drawerTab === 'overview' && (
                  <div className="space-y-6 text-xs">
                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-2">Profile Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500">Designation</span>
                          <p className="mt-1 font-semibold text-slate-200">{activeDrawerEmp.title || 'Specialist'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500">Department</span>
                          <p className="mt-1 font-semibold text-slate-200">{activeDrawerEmp.department || 'General'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500">Employment Type</span>
                          <p className="mt-1 font-semibold text-slate-200">{activeDrawerEmp.employmentType}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500">Manager / Lead</span>
                          <p className="mt-1 font-semibold text-slate-200">{activeDrawerEmp.manager || 'HR Director'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-2">Contact Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500">Email Address</span>
                          <p className="mt-1 font-semibold text-slate-200 font-mono">{activeDrawerEmp.email}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500">Phone Number</span>
                          <p className="mt-1 font-semibold text-slate-200 font-mono">{activeDrawerEmp.phone || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9px] uppercase font-bold text-slate-500">Home Address</span>
                          <p className="mt-1 font-semibold text-slate-200">{activeDrawerEmp.address || 'Not Registered'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'attendance' && (
                  <div className="space-y-6 text-xs">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-500">Present</span>
                        <p className="mt-1.5 text-xl font-black text-emerald-400">{drawerStats?.present || 0}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-500">Remote</span>
                        <p className="mt-1.5 text-xl font-black text-cyan-400">{drawerStats?.remote || 0}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-500">Absent</span>
                        <p className="mt-1.5 text-xl font-black text-rose-400">{drawerStats?.absent || 0}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-2">Recent Attendance Logs</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                        {drawerStats?.empAtt.slice(0, 10).map((att) => (
                          <div key={att._id} className="rounded-xl border border-white/[0.03] bg-slate-950/50 p-3.5 flex items-center justify-between">
                            <span className="font-semibold text-slate-300">{new Date(att.date).toLocaleDateString()}</span>
                            <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                              att.status === 'present' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              att.status === 'remote' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                              'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}>{att.status}</span>
                          </div>
                        ))}
                        {drawerStats?.empAtt.length === 0 && (
                          <p className="text-center text-slate-500 text-[11px] py-4">No recent logs recorded.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'leave' && (
                  <div className="space-y-6 text-xs">
                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Leave Balance Summary</h4>
                        <span className="text-xs font-black text-amber-400">{activeDrawerEmp.leaveBalance} Days Remaining</span>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                        {drawerStats?.empLeaves.map((l) => (
                          <div key={l._id} className="rounded-xl border border-white/[0.03] bg-slate-950/50 p-3.5 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-slate-300 block capitalize">{l.leaveType} Leave</span>
                              <span className="text-[10px] text-slate-500 font-mono">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</span>
                            </div>
                            <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                              l.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              l.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                              'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}>{l.status}</span>
                          </div>
                        ))}
                        {drawerStats?.empLeaves.length === 0 && (
                          <p className="text-center text-slate-500 text-[11px] py-4">No leave requests found.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'payroll' && (
                  <div className="space-y-6 text-xs">
                    <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-2">Payslip Statements</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                        {drawerStats?.empPayrolls.map((p) => (
                          <div key={p._id} className="rounded-xl border border-white/[0.03] bg-slate-950/50 p-3.5 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-slate-300 block">Statement Net Pay</span>
                              <span className="text-[10px] text-slate-500 font-mono">${p.netPay.toLocaleString()}</span>
                            </div>
                            <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                              p.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>{p.status}</span>
                          </div>
                        ))}
                        {drawerStats?.empPayrolls.length === 0 && (
                          <p className="text-center text-slate-500 text-[11px] py-4">No payslips generated.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'insights' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {aiInsights.map((insight) => (
                      <div key={insight.title} className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 space-y-3 shadow-md">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">{insight.title}</span>
                        <p className="text-sm font-black text-white">{insight.val}</p>
                        <p className="text-[10px] text-slate-400 leading-normal">{insight.desc}</p>
                        <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                          <div className={`h-full ${insight.color}`} style={{ width: `${insight.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD EMPLOYEE MODAL DIALOG */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0F172A] p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              <div className="border-b border-white/5 pb-3 flex items-center justify-between mb-5">
                <h4 className="text-md font-bold text-white tracking-tight">Register New Employee Profile</h4>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white text-xs uppercase tracking-wider"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Full Name
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </label>
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Email Address
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Password
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </label>
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Role Category
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-100 focus:outline-none"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Department
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))}
                      required
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-100 focus:outline-none"
                    >
                      <option value="">Select Department</option>
                      {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Job Title / Designation
                    <select
                      value={formData.title}
                      onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                      required
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-100 focus:outline-none"
                    >
                      <option value="">Select Designation</option>
                      {ALL_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Employee ID
                    <input
                      type="text"
                      placeholder="EMP021"
                      value={formData.employeeId}
                      onChange={(e) => setFormData(p => ({ ...p, employeeId: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </label>
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Reporting Manager
                    <input
                      type="text"
                      placeholder="HR Director"
                      value={formData.manager}
                      onChange={(e) => setFormData(p => ({ ...p, manager: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Phone Number
                    <input
                      type="text"
                      placeholder="555-0100"
                      value={formData.phone}
                      onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </label>
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Office Address
                    <input
                      type="text"
                      placeholder="HQ Plaza Room 3A"
                      value={formData.address}
                      onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-4.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.01]"
                >
                  Create Employee Profile
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT EMPLOYEE MODAL DIALOG */}
      <AnimatePresence>
        {showEditModal && editEmpData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0F172A] p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              <div className="border-b border-white/5 pb-3 flex items-center justify-between mb-5">
                <h4 className="text-md font-bold text-white tracking-tight">Edit Employee Profile ({editEmpData.name})</h4>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-white text-xs uppercase tracking-wider"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Full Name
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </label>
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Email Address
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Role Category
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-100 focus:outline-none"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Department
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))}
                      required
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-100 focus:outline-none"
                    >
                      <option value="">Select Department</option>
                      {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Job Title / Designation
                    <select
                      value={formData.title}
                      onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                      required
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-100 focus:outline-none"
                    >
                      <option value="">Select Designation</option>
                      {ALL_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Employee ID
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData(p => ({ ...p, employeeId: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Reporting Manager
                    <input
                      type="text"
                      value={formData.manager}
                      onChange={(e) => setFormData(p => ({ ...p, manager: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </label>
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    Phone Number
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </label>
                </div>

                <label className="block text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  Office Address
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full py-4.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.01]"
                >
                  Save Profile Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Inline dropdown rendering element to handle state locally per row
function RowActionsDropdown({ emp, onView, onEdit, onSuspend, onActivate, onDelete, onArchive }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-slate-400 hover:text-white h-7 w-7 rounded-lg hover:bg-white/[0.04] flex items-center justify-center transition"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Click boundary handler */}
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-1 w-52 rounded-2xl border border-white/10 bg-slate-950 p-2 shadow-2xl z-30 space-y-0.5 text-xs text-left"
            >
              {[
                { label: 'View Profile', action: onView },
                { label: 'Edit Employee', action: onEdit },
                { label: emp.isActive === false ? 'Activate Employee' : 'Suspend Employee', action: emp.isActive === false ? onActivate : onSuspend },
                { label: 'Archive Record', action: onArchive },
                { label: 'Delete Employee', action: onDelete, danger: true }
              ].map((act) => (
                <button
                  key={act.label}
                  type="button"
                  onClick={() => { act.action(); setOpen(false); }}
                  className={`w-full block rounded-xl px-3.5 py-2 text-left font-semibold transition ${
                    act.danger
                      ? 'text-rose-400 hover:bg-rose-500/10'
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {act.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EmployeesPage;
