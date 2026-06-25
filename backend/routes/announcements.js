import express from 'express';
import Announcement from '../models/Announcement.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all announcements
router.get('/', authenticate, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new announcement (admin only)
router.post('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      createdBy: req.user.id
    });

    const populated = await announcement.populate('createdBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete announcement (admin only)
router.delete('/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await Announcement.deleteOne({ _id: req.params.id });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
