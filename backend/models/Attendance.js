import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  breaks: [
    {
      start: { type: Date },
      end: { type: Date }
    }
  ],
  status: {
    type: String,
    enum: ['present', 'absent', 'leave', 'remote'],
    default: 'present'
  },
  totalHours: { type: Number, default: 0 },
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
export default Attendance;
