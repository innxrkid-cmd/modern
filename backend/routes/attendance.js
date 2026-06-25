import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createAttendance,
  getAttendanceRecords,
  getAttendanceById,
  getAttendanceByUser,
  updateAttendance,
  deleteAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('admin', 'employee'), createAttendance);
router.get('/', authenticate, authorizeRoles('admin', 'employee'), getAttendanceRecords);
router.get('/user/:userId', authenticate, authorizeRoles('admin', 'employee'), getAttendanceByUser);
router.get('/:id', authenticate, authorizeRoles('admin', 'employee'), getAttendanceById);
router.put('/:id', authenticate, authorizeRoles('admin', 'employee'), updateAttendance);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteAttendance);

export default router;
