import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createPayroll,
  getPayrollRecords,
  getPayrollById,
  updatePayroll,
  markPayrollPaid,
  deletePayroll
} from '../controllers/payrollController.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('admin'), createPayroll);
router.get('/', authenticate, authorizeRoles('admin', 'employee'), getPayrollRecords);
router.get('/:id', authenticate, authorizeRoles('admin', 'employee'), getPayrollById);
router.put('/:id', authenticate, authorizeRoles('admin'), updatePayroll);
router.post('/:id/pay', authenticate, authorizeRoles('admin'), markPayrollPaid);
router.delete('/:id', authenticate, authorizeRoles('admin'), deletePayroll);

export default router;
