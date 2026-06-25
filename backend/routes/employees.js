import express from 'express';
import User from '../models/User.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/count', authenticate, authorizeRoles('admin', 'employee'), async (req, res) => {
  try {
    const count = await User.countDocuments({ role: 'employee' });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().sort({ role: -1, name: 1 }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/summary/leaves', authenticate, authorizeRoles('admin', 'employee'), async (req, res) => {
  res.json({ count: 0 });
});

router.get('/summary/announcements', authenticate, authorizeRoles('admin', 'employee'), async (req, res) => {
  res.json({ count: 0 });
});

export default router;
