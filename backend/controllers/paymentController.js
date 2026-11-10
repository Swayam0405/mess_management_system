const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private (Admin)
const getAllPayments = async (req, res, next) => {
  try {
    const { status, month, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (month) filter.month = month;

    let query = Payment.find(filter).populate('student', 'name email rollNumber hostelBlock roomNumber');

    const payments = await query.sort({ paymentDate: -1 });

    let filtered = payments;
    if (search) {
      const reg = new RegExp(search, 'i');
      filtered = payments.filter(p => {
        const s = p.student;
        return (
          p.transactionId.match(reg) ||
          (s && (s.name.match(reg) || s.email.match(reg) || (s.rollNumber && s.rollNumber.match(reg))))
        );
      });
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment by ID
// @route   GET /api/payments/:id
// @access  Private (Admin & Student)
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('student', 'name email rollNumber hostelBlock roomNumber phone department');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.'
      });
    }

    // If student, check ownership
    if (req.user.role === 'student' && payment.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment receipt.'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin record payment on behalf of student
// @route   POST /api/payments
// @access  Private (Admin)
const createPayment = async (req, res, next) => {
  try {
    const { studentId, amount, month, paymentMethod, status, remarks } = req.body;

    if (!studentId || !amount || !month) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, amount, and billing month are required.'
      });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Selected student not found.'
      });
    }

    const transactionId = `TXN-ADM-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await Payment.create({
      student: studentId,
      transactionId,
      amount: Number(amount),
      month,
      paymentMethod: paymentMethod || 'Cash / Admin Entry',
      status: status || 'Paid',
      remarks: remarks || 'Recorded by Admin',
      recordedBy: req.user.id
    });

    // Update student subscription status if Paid
    if (status === 'Paid') {
      const sub = await Subscription.findOne({ student: studentId });
      if (sub) {
        sub.status = 'active';
        await sub.save();
      }
    }

    const populatedPayment = await Payment.findById(payment._id).populate('student', 'name email rollNumber');

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      data: populatedPayment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin update payment status
// @route   PUT /api/payments/:id
// @access  Private (Admin)
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.'
      });
    }

    if (status) payment.status = status;
    if (remarks !== undefined) payment.remarks = remarks;
    payment.recordedBy = req.user.id;

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully.',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete payment record
// @route   DELETE /api/payments/:id
// @access  Private (Admin)
const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  deletePayment
};
