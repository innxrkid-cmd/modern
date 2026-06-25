import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'employee'], default: 'employee' },
  title: { type: String, default: '' },
  department: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  hireDate: { type: Date },
  employeeId: { type: String, unique: true, sparse: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
