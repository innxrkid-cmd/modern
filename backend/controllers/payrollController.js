import Payroll from '../models/Payroll.js';

const sumItems = (items) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => total + (item?.amount || 0), 0);
};

export const createPayroll = async (req, res) => {
  try {
    const { user, payPeriodStart, payPeriodEnd, baseSalary, allowances = [], deductions = [], taxAmount = 0, notes } = req.body;
    const allowancesTotal = sumItems(allowances);
    const deductionsTotal = sumItems(deductions);
    const netPay = (baseSalary || 0) + allowancesTotal - deductionsTotal - taxAmount;

    const payroll = await Payroll.create({
      user,
      payPeriodStart,
      payPeriodEnd,
      baseSalary,
      allowances,
      deductions,
      taxAmount,
      netPay,
      notes
    });

    res.status(201).json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPayrollRecords = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user.id };
    const records = await Payroll.find(query)
      .populate('user', 'name email role employeeId')
      .sort({ payPeriodEnd: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('user', 'name email role employeeId');
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    if (req.user.role !== 'admin' && payroll.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const allowedFields = ['user', 'payPeriodStart', 'payPeriodEnd', 'baseSalary', 'allowances', 'deductions', 'taxAmount', 'notes', 'status', 'paymentDate'];
    allowedFields.forEach((field) => {
      if (field in req.body) {
        payroll[field] = req.body[field];
      }
    });

    const allowancesTotal = sumItems(payroll.allowances);
    const deductionsTotal = sumItems(payroll.deductions);
    payroll.netPay = (payroll.baseSalary || 0) + allowancesTotal - deductionsTotal - (payroll.taxAmount || 0);

    await payroll.save();
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markPayrollPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    payroll.status = 'paid';
    payroll.paymentDate = new Date();
    await payroll.save();
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    await payroll.remove();
    res.json({ message: 'Payroll record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const payAllPendingPayroll = async (req, res) => {
  try {
    const result = await Payroll.updateMany(
      { status: 'pending' },
      { $set: { status: 'paid', paymentDate: new Date() } }
    );
    res.json({ message: `Successfully processed ${result.modifiedCount} payroll records.`, count: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
