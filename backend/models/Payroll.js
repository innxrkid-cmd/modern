import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payPeriodStart: { type: Date, required: true },
  payPeriodEnd: { type: Date, required: true },
  baseSalary: { type: Number, required: true },
  allowances: [
    {
      name: { type: String, trim: true },
      amount: { type: Number, default: 0 }
    }
  ],
  deductions: [
    {
      name: { type: String, trim: true },
      amount: { type: Number, default: 0 }
    }
  ],
  taxAmount: { type: Number, default: 0 },
  netPay: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentDate: { type: Date },
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const Payroll = mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);
export default Payroll;
