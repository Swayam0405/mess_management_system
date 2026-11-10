const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Menu = require('../models/Menu');
const Announcement = require('../models/Announcement');
const Feedback = require('../models/Feedback');
const MealAttendance = require('../models/MealAttendance');

// Helper to get today's day name (Monday, Tuesday, etc.)
const getDayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

// @desc    Get complete student dashboard summary
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getDashboardSummary = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const todayName = getDayName();

    // 1. Student profile
    const student = await User.findById(studentId);

    // 2. Subscription
    let subscription = await Subscription.findOne({ student: studentId });
    if (!subscription) {
      subscription = await Subscription.create({
        student: studentId,
        planName: 'Standard Monthly All-Meals',
        monthlyFee: 4200,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    // 3. Current month payment status
    const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const latestPayment = await Payment.findOne({
      student: studentId,
      month: currentMonthStr
    }).sort({ createdAt: -1 });

    const currentFeeStatus = {
      month: currentMonthStr,
      monthlyFee: subscription.monthlyFee,
      isPaid: latestPayment && latestPayment.status === 'Paid',
      paymentStatus: latestPayment ? latestPayment.status : 'Pending',
      lastPaymentDate: latestPayment ? latestPayment.paymentDate : null,
      transactionId: latestPayment ? latestPayment.transactionId : null
    };

    // 4. Today's Menu
    const todaysMenu = await Menu.find({ day: todayName }).sort({ mealType: 1 });

    // 5. Recent Announcements
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Recent Attendances for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayAttendances = await MealAttendance.find({
      student: studentId,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    // 7. Recent Feedback (last 3)
    const recentFeedbacks = await Feedback.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      data: {
        student,
        subscription,
        currentFeeStatus,
        todayName,
        todaysMenu,
        todayAttendances,
        announcements,
        recentFeedbacks
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's payment history
// @route   GET /api/student/payments
// @access  Private (Student)
const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.user.id }).sort({ paymentDate: -1 });
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student demo payment submission
// @route   POST /api/student/pay
// @access  Private (Student)
const makePayment = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { amount, month, paymentMethod } = req.body;

    const subscription = await Subscription.findOne({ student: studentId });
    const feeToPay = amount || (subscription ? subscription.monthlyFee : 4200);
    const currentMonth = month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    // Generate unique demo transaction ID
    const transactionId = `TXN-CMS-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await Payment.create({
      student: studentId,
      transactionId,
      amount: feeToPay,
      month: currentMonth,
      paymentMethod: paymentMethod || 'UPI',
      status: 'Paid',
      remarks: 'Online Demo Payment via Student Portal'
    });

    // Ensure subscription is active
    if (subscription) {
      subscription.status = 'active';
      await subscription.save();
    }

    res.status(201).json({
      success: true,
      message: 'Mess fee payment recorded successfully!',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit student feedback
// @route   POST /api/student/feedback
// @access  Private (Student)
const submitFeedback = async (req, res, next) => {
  try {
    const { category, mealType, rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required.'
      });
    }

    const feedback = await Feedback.create({
      student: req.user.id,
      category: category || 'Food Quality',
      mealType: mealType || 'General',
      rating: Number(rating),
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for your input!',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own feedback list
// @route   GET /api/student/feedback
// @access  Private (Student)
const getMyFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in / record meal attendance for student
// @route   POST /api/student/attendance
// @access  Private (Student)
const markAttendance = async (req, res, next) => {
  try {
    const { mealType, status } = req.body;

    if (!mealType) {
      return res.status(400).json({
        success: false,
        message: 'Meal type is required (breakfast, lunch, snacks, dinner).'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already marked
    const existing = await MealAttendance.findOne({
      student: req.user.id,
      date: today,
      mealType: mealType.toLowerCase()
    });

    if (existing) {
      existing.status = status || 'Consumed';
      existing.checkInTime = new Date();
      await existing.save();

      return res.status(200).json({
        success: true,
        message: `${mealType.toUpperCase()} attendance updated.`,
        data: existing
      });
    }

    const attendance = await MealAttendance.create({
      student: req.user.id,
      date: today,
      mealType: mealType.toLowerCase(),
      status: status || 'Consumed',
      checkInTime: new Date()
    });

    res.status(201).json({
      success: true,
      message: `${mealType.toUpperCase()} check-in recorded successfully!`,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student attendance history
// @route   GET /api/student/attendance
// @access  Private (Student)
const getAttendanceHistory = async (req, res, next) => {
  try {
    const attendances = await MealAttendance.find({ student: req.user.id })
      .sort({ date: -1, checkInTime: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: attendances.length,
      data: attendances
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getPaymentHistory,
  makePayment,
  submitFeedback,
  getMyFeedback,
  markAttendance,
  getAttendanceHistory
};
