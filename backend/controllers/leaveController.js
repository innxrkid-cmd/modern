import LeaveRequest from '../models/LeaveRequest.js';

export const createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const leave = await LeaveRequest.create({
      user: req.user.id,
      leaveType,
      startDate,
      endDate,
      reason
    });
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    const query = (req.user.role === 'admin' && req.query.personal !== 'true') ? {} : { user: req.user.id };
    const leaves = await LeaveRequest.find(query)
      .populate('user', 'name email role employeeId')
      .populate('approvedBy', 'name email role')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaveRequestById = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id)
      .populate('user', 'name email role employeeId')
      .populate('approvedBy', 'name email role');
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    if (req.user.role !== 'admin' && leave.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeaveRequest = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    if (req.user.role !== 'admin' && leave.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (leave.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Only pending leave requests can be updated' });
    }

    const allowedFields = ['leaveType', 'startDate', 'endDate', 'reason'];
    allowedFields.forEach((field) => {
      if (field in req.body) {
        leave[field] = req.body[field];
      }
    });

    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveLeaveRequest = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be approved' });
    }

    leave.status = 'approved';
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectLeaveRequest = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be rejected' });
    }

    leave.status = 'rejected';
    leave.approvedBy = req.user.id;
    leave.rejectedAt = new Date();
    leave.rejectionReason = req.body.rejectionReason || 'Rejected by admin';
    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLeaveRequest = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    if (req.user.role !== 'admin' && leave.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.user.role !== 'admin' && leave.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be deleted' });
    }

    await leave.remove();
    res.json({ message: 'Leave request deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
