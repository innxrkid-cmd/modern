import Attendance from '../models/Attendance.js';

const normalizeDate = (value) => {
  const date = new Date(value || Date.now());
  date.setHours(0, 0, 0, 0);
  return date;
};

export const createAttendance = async (req, res) => {
  try {
    const { date, checkIn, checkOut, breaks, status, notes } = req.body;
    const attendanceDate = normalizeDate(date);
    const existing = await Attendance.findOne({ user: req.user.id, date: attendanceDate });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already recorded for this date' });
    }

    const record = await Attendance.create({
      user: req.user.id,
      date: attendanceDate,
      checkIn,
      checkOut,
      breaks,
      status,
      notes
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceRecords = async (req, res) => {
  try {
    const query = (req.user.role === 'admin' && req.query.personal !== 'true') ? {} : { user: req.user.id };
    const attendance = await Attendance.find(query).populate('user', 'name email role employeeId').sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate('user', 'name email role employeeId');
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    if (req.user.role !== 'admin' && attendance.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const attendance = await Attendance.find({ user: userId }).populate('user', 'name email role employeeId').sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    if (req.user.role !== 'admin' && attendance.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const allowedFields = ['checkIn', 'checkOut', 'breaks', 'status', 'notes', 'date', 'totalHours'];
    allowedFields.forEach((field) => {
      if (field in req.body) {
        attendance[field] = req.body[field];
      }
    });

    if (req.body.date) {
      attendance.date = normalizeDate(req.body.date);
    }

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    await attendance.remove();
    res.json({ message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
