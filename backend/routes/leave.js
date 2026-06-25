import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  deleteLeaveRequest
} from '../controllers/leaveController.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('admin', 'employee'), createLeaveRequest);
router.get('/', authenticate, authorizeRoles('admin', 'employee'), getLeaveRequests);
router.get('/:id', authenticate, authorizeRoles('admin', 'employee'), getLeaveRequestById);
router.put('/:id', authenticate, authorizeRoles('admin', 'employee'), updateLeaveRequest);
router.post('/:id/approve', authenticate, authorizeRoles('admin'), approveLeaveRequest);
router.post('/:id/reject', authenticate, authorizeRoles('admin'), rejectLeaveRequest);
router.delete('/:id', authenticate, authorizeRoles('admin', 'employee'), deleteLeaveRequest);

export default router;
