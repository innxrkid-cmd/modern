import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createUser,
  getAllUsers,
  getCurrentUser,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('admin'), createUser);
router.get('/', authenticate, authorizeRoles('admin'), getAllUsers);
router.get('/me', authenticate, getCurrentUser);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export default router;
