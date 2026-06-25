import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, title, department, phone, address, employeeId, manager } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
      title,
      department,
      phone,
      address,
      employeeId,
      manager
    });

    res.status(201).json({ user: await User.findById(user._id).select('-password') });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ role: -1, name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const allowedFields = ['name', 'title', 'department', 'phone', 'address', 'employeeId', 'manager', 'isActive', 'role'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (field in req.body) updates[field] = req.body[field];
    });

    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const deletedUser = await User.findByIdAndDelete(id).select('-password');
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted', user: deletedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
