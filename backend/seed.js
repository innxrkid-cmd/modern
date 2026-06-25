import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import User from './models/User.js';
import Attendance from './models/Attendance.js';
import LeaveRequest from './models/LeaveRequest.js';
import Payroll from './models/Payroll.js';

dotenv.config();

const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const titles = ['Software Engineer', 'HR Specialist', 'Sales Executive', 'Marketing Coordinator', 'Finance Analyst', 'Operations Manager'];
const leaveTypes = ['sick', 'vacation', 'personal', 'unpaid', 'other'];
const baseNames = [
  'Ava Clarke', 'Noah Patel', 'Mia Johnson', 'Lucas Carter', 'Ella Wright',
  'Ethan Harris', 'Zoe Lee', 'Liam Kim', 'Chloe Davis', 'Owen Brooks',
  'Isla Bennett', 'Mason Torres', 'Lily Morgan', 'Caleb Cooper', 'Grace Price',
  'Leo Flores', 'Nora Ramirez', 'Eli Parker', 'Ruby Adams', 'Jonah Ross'
];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const makeBusinessDates = (days) => {
  const dates = [];
  const today = new Date();
  let cursor = new Date(today);
  while (dates.length < days) {
    cursor.setDate(cursor.getDate() - 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(cursor));
    }
  }
  return dates.reverse();
};

const addTime = (date, hours, minutes = 0) => {
  const copy = new Date(date);
  copy.setHours(hours, minutes, 0, 0);
  return copy;
};

const createAttendanceForUser = (user, dates) => {
  return dates.map((date) => {
    const statusRoll = Math.random();
    let status = 'present';
    if (statusRoll < 0.08) status = 'absent';
    else if (statusRoll < 0.16) status = 'leave';
    else if (statusRoll < 0.28) status = 'remote';

    const record = {
      user: user._id,
      date,
      status,
      notes: status === 'remote' ? 'Remote work day' : status === 'absent' ? 'No show' : '',
      createdAt: new Date()
    };

    if (status !== 'absent' && status !== 'leave') {
      const checkIn = addTime(date, randomInt(8, 9), randomInt(0, 30));
      const checkOut = addTime(date, randomInt(16, 18), randomInt(0, 30));
      const breakStart = addTime(date, 12, randomInt(0, 30));
      const breakEnd = new Date(breakStart);
      breakEnd.setHours(breakStart.getHours() + 1);

      record.checkIn = checkIn;
      record.checkOut = checkOut;
      record.breaks = [{ start: breakStart, end: breakEnd }];
      record.totalHours = Math.max(0, (checkOut - checkIn - 3600000) / 3600000);
    }

    return record;
  });
};

const createLeaveRequestsForUser = (user, adminId) => {
  const requests = [];
  const requestCount = randomInt(1, 2);
  const today = new Date();

  for (let i = 0; i < requestCount; i += 1) {
    const offset = randomInt(5, 25);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - offset);
    const length = randomInt(1, 4);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + length - 1);
    const statusRoll = Math.random();
    let status = 'approved';
    if (statusRoll < 0.12) status = 'rejected';
    else if (statusRoll < 0.22) status = 'pending';
    else if (statusRoll < 0.28) status = 'cancelled';

    const request = {
      user: user._id,
      leaveType: randomFrom(leaveTypes),
      startDate,
      endDate,
      reason: 'Planned time off for personal matters.',
      status,
      createdAt: new Date()
    };

    if (status === 'approved') {
      request.approvedBy = adminId;
      request.approvedAt = new Date();
    }
    if (status === 'rejected') {
      request.rejectedAt = new Date();
      request.rejectionReason = 'Not enough leave balance';
      request.approvedBy = adminId;
    }

    requests.push(request);
  }

  return requests;
};

const createPayrollForUser = (user) => {
  const payrolls = [];
  const today = new Date();

  for (let i = 1; i >= 0; i -= 1) {
    const periodStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const periodEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
    const baseSalary = randomInt(4500, 9000);
    const allowances = [
      { name: 'Transport Allowance', amount: randomInt(150, 400) },
      { name: 'Meal Allowance', amount: randomInt(100, 250) }
    ];
    const deductions = [
      { name: 'Health Insurance', amount: randomInt(120, 260) },
      { name: 'Retirement Fund', amount: randomInt(180, 320) }
    ];
    const grossIncome = baseSalary + allowances.reduce((sum, item) => sum + item.amount, 0);
    const deductionTotal = deductions.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = Math.round(grossIncome * 0.16);
    const netPay = Math.round(grossIncome - deductionTotal - taxAmount);

    payrolls.push({
      user: user._id,
      payPeriodStart: periodStart,
      payPeriodEnd: periodEnd,
      baseSalary,
      allowances,
      deductions,
      taxAmount,
      netPay,
      status: i === 1 ? 'paid' : 'pending',
      paymentDate: i === 1 ? new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate() + 2) : null,
      notes: i === 1 ? 'Salary paid on schedule.' : 'Salary pending approval.',
      createdAt: new Date()
    });
  }

  return payrolls;
};

const seed = async () => {
  await connectDB();

  console.log('Cleaning existing employee data...');
  await Attendance.deleteMany();
  await LeaveRequest.deleteMany();
  await Payroll.deleteMany();
  await User.deleteMany({ role: 'employee' });

  const adminEmail = 'admin@modernhrms.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const adminPassword = await bcrypt.hash('Admin@1234', 10);
    admin = await User.create({
      name: 'HR Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      title: 'HR Director',
      department: 'HR',
      phone: '555-0100',
      address: '1 Corporate Plaza',
      hireDate: new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
      employeeId: 'EMP000'
    });
    console.log('Created admin user:', adminEmail);
  }

  const businessDates = makeBusinessDates(20);

  const employees = await Promise.all(
    baseNames.map(async (name, index) => {
      const email = `${name.toLowerCase().replace(/\s+/g, '.')}@modernhrms.com`;
      const password = await bcrypt.hash('Password123!', 10);
      const department = departments[index % departments.length];
      const title = titles[index % titles.length];
      const hireDate = new Date();
      hireDate.setMonth(hireDate.getMonth() - randomInt(3, 24));

      return User.create({
        name,
        email,
        password,
        role: 'employee',
        title,
        department,
        phone: `555-01${String(index + 10).padStart(2, '0')}`,
        address: `${randomInt(100, 999)} Enterprise Blvd`,
        hireDate,
        employeeId: `EMP${String(index + 1).padStart(3, '0')}`,
        manager: admin._id
      });
    })
  );

  console.log(`Created ${employees.length} employee users.`);

  const attendanceDocs = [];
  const leaveDocs = [];
  const payrollDocs = [];

  for (const employee of employees) {
    attendanceDocs.push(...createAttendanceForUser(employee, businessDates));
    leaveDocs.push(...createLeaveRequestsForUser(employee, admin._id));
    payrollDocs.push(...createPayrollForUser(employee));
  }

  await Attendance.insertMany(attendanceDocs);
  await LeaveRequest.insertMany(leaveDocs);
  await Payroll.insertMany(payrollDocs);

  console.log(`Seeded ${attendanceDocs.length} attendance records.`);
  console.log(`Seeded ${leaveDocs.length} leave requests.`);
  console.log(`Seeded ${payrollDocs.length} payroll records.`);
  console.log('✅ Seed data generation complete.');
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
