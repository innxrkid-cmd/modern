import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: {
    type: String,
    enum: ['sick', 'vacation', 'personal', 'unpaid', 'other'],
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', leaveRequestSchema);
export default LeaveRequest;
