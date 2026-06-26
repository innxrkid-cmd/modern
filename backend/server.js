import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import userRoutes from './routes/users.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leave.js';
import payrollRoutes from './routes/payroll.js';
import announcementRoutes from './routes/announcements.js';
import suggestionRoutes from './routes/suggestions.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const clientUrl = process.env.CLIENT_URL;
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === clientUrl || clientUrl === '*') {
      return callback(null, true);
    }
    // Allow any local network origin (localhost, 127.0.0.1, or private IP ranges)
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin);
    if (isLocal) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/suggestions', suggestionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend is running on http://localhost:${PORT}`);
});
