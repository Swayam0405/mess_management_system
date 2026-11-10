const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Feedback = require('../models/Feedback');
const MealAttendance = require('../models/MealAttendance');
const Menu = require('../models/Menu');

// @desc    Get Admin Dashboard Statistics and Chart Data
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total registered students
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', status: 'active' });

    // 2. Active subscriptions
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });

    // 3. Current month revenue
    const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const currentMonthPayments = await Payment.find({
      month: currentMonthStr,
      status: 'Paid'
    });
    const monthlyRevenue = currentMonthPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // Total all-time revenue
    const allPaidPayments = await Payment.find({ status: 'Paid' });
    const totalRevenue = allPaidPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // 4. Pending payments for current month
    const pendingPaymentsCount = await Payment.countDocuments({
      status: 'Pending'
    });
    const pendingPayments = await Payment.find({ status: 'Pending' });
    const pendingAmount = pendingPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // 5. Today's meal stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayAttendances = await MealAttendance.find({
      date: { $gte: todayStart, $lte: todayEnd },
      status: 'Consumed'
    });

    const mealStats = {
      breakfast: todayAttendances.filter(a => a.mealType === 'breakfast').length,
      lunch: todayAttendances.filter(a => a.mealType === 'lunch').length,
      snacks: todayAttendances.filter(a => a.mealType === 'snacks').length,
      dinner: todayAttendances.filter(a => a.mealType === 'dinner').length,
      totalToday: todayAttendances.length
    };

    // 6. Recent Payments
    const recentPayments = await Payment.find()
      .populate('student', 'name email rollNumber hostelBlock roomNumber')
      .sort({ createdAt: -1 })
      .limit(6);

    // 7. Recent Feedbacks
    const recentFeedbacks = await Feedback.find()
      .populate('student', 'name email rollNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    // 8. Payment status distribution (for Chart.js)
    const paidCount = await Payment.countDocuments({ status: 'Paid' });
    const pendingCount = await Payment.countDocuments({ status: 'Pending' });
    const failedCount = await Payment.countDocuments({ status: 'Failed' });

    // 9. Dietary preferences distribution
    const vegCount = await User.countDocuments({ role: 'student', dietaryPreference: 'Veg' });
    const nonVegCount = await User.countDocuments({ role: 'student', dietaryPreference: 'Non-Veg' });
    const jainCount = await User.countDocuments({ role: 'student', dietaryPreference: 'Special Jain' });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        activeSubscriptions,
        monthlyRevenue,
        totalRevenue,
        pendingPaymentsCount,
        pendingAmount,
        currentMonth: currentMonthStr,
        mealStats,
        recentPayments,
        recentFeedbacks,
        charts: {
          paymentStatus: {
            labels: ['Paid', 'Pending', 'Failed'],
            counts: [paidCount, pendingCount, failedCount]
          },
          dietary: {
            labels: ['Veg', 'Non-Veg', 'Special Jain'],
            counts: [vegCount, nonVegCount, jainCount]
          },
          todayMeals: {
            labels: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
            counts: [mealStats.breakfast, mealStats.lunch, mealStats.snacks, mealStats.dinner]
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students with filters & search
// @route   GET /api/admin/students
// @access  Private (Admin)
const getAllStudents = async (req, res, next) => {
  try {
    const { search, status, dietaryPreference, hostelBlock } = req.query;

    const query = { role: 'student' };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { rollNumber: searchRegex },
        { department: searchRegex }
      ];
    }

    if (status) query.status = status;
    if (dietaryPreference) query.dietaryPreference = dietaryPreference;
    if (hostelBlock) query.hostelBlock = hostelBlock;

    const students = await User.find(query).sort({ createdAt: -1 });

    // Attach subscriptions
    const studentIds = students.map(s => s._id);
    const subscriptions = await Subscription.find({ student: { $in: studentIds } });
    const subMap = {};
    subscriptions.forEach(sub => {
      subMap[sub.student.toString()] = sub;
    });

    const studentsWithSubs = students.map(student => ({
      ...student.toObject(),
      subscription: subMap[student._id.toString()] || null
    }));

    res.status(200).json({
      success: true,
      count: studentsWithSubs.length,
      data: studentsWithSubs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details with payments & attendance
// @route   GET /api/admin/students/:id
// @access  Private (Admin)
const getStudentById = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    const subscription = await Subscription.findOne({ student: student._id });
    const payments = await Payment.find({ student: student._id }).sort({ paymentDate: -1 });
    const attendances = await MealAttendance.find({ student: student._id })
      .sort({ date: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        student,
        subscription,
        payments,
        attendances
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin add new student
// @route   POST /api/admin/students
// @access  Private (Admin)
const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      roomNumber,
      hostelBlock,
      phone,
      department,
      year,
      dietaryPreference,
      monthlyFee,
      planName
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists.'
      });
    }

    if (rollNumber) {
      const rollExists = await User.findOne({ rollNumber: rollNumber.toUpperCase() });
      if (rollExists) {
        return res.status(400).json({
          success: false,
          message: 'Student with this roll number already exists.'
        });
      }
    }

    const student = await User.create({
      name,
      email,
      password: password || 'Student@123',
      role: 'student',
      rollNumber: rollNumber ? rollNumber.toUpperCase() : undefined,
      roomNumber: roomNumber || 'N/A',
      hostelBlock: hostelBlock || 'Block A',
      phone: phone || '',
      department: department || 'General Engineering',
      year: year || 1,
      dietaryPreference: dietaryPreference || 'Veg',
      status: 'active'
    });

    const subscription = await Subscription.create({
      student: student._id,
      planName: planName || 'Standard Monthly All-Meals',
      monthlyFee: monthlyFee ? Number(monthlyFee) : 4200,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully.',
      data: {
        student,
        subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin edit student details
// @route   PUT /api/admin/students/:id
// @access  Private (Admin)
const updateStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      rollNumber,
      roomNumber,
      hostelBlock,
      phone,
      department,
      year,
      dietaryPreference,
      status,
      monthlyFee,
      planName,
      subscriptionStatus
    } = req.body;

    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    // Check duplicate email if changed
    if (email && email !== student.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user.'
        });
      }
      student.email = email;
    }

    // Check duplicate roll number if changed
    if (rollNumber && rollNumber.toUpperCase() !== student.rollNumber) {
      const rollExists = await User.findOne({ rollNumber: rollNumber.toUpperCase() });
      if (rollExists) {
        return res.status(400).json({
          success: false,
          message: 'Roll number is already taken.'
        });
      }
      student.rollNumber = rollNumber.toUpperCase();
    }

    if (name) student.name = name;
    if (roomNumber !== undefined) student.roomNumber = roomNumber;
    if (hostelBlock !== undefined) student.hostelBlock = hostelBlock;
    if (phone !== undefined) student.phone = phone;
    if (department !== undefined) student.department = department;
    if (year !== undefined) student.year = Number(year);
    if (dietaryPreference) student.dietaryPreference = dietaryPreference;
    if (status) student.status = status;

    await student.save();

    // Update subscription if fields provided
    let subscription = await Subscription.findOne({ student: student._id });
    if (subscription) {
      if (monthlyFee !== undefined) subscription.monthlyFee = Number(monthlyFee);
      if (planName) subscription.planName = planName;
      if (subscriptionStatus) subscription.status = subscriptionStatus;
      await subscription.save();
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully.',
      data: {
        student,
        subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete student
// @route   DELETE /api/admin/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    // Cascade delete student related data
    await Subscription.deleteMany({ student: student._id });
    await Payment.deleteMany({ student: student._id });
    await Feedback.deleteMany({ student: student._id });
    await MealAttendance.deleteMany({ student: student._id });
    await User.findByIdAndDelete(student._id);

    res.status(200).json({
      success: true,
      message: `Student '${student.name}' and all associated records deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscription for a student
// @route   PUT /api/admin/subscriptions/:studentId
// @access  Private (Admin)
const updateSubscription = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { monthlyFee, status, planName, endDate } = req.body;

    let sub = await Subscription.findOne({ student: studentId });
    if (!sub) {
      sub = new Subscription({ student: studentId });
    }

    if (monthlyFee !== undefined) sub.monthlyFee = Number(monthlyFee);
    if (status) sub.status = status;
    if (planName) sub.planName = planName;
    if (endDate) sub.endDate = new Date(endDate);

    await sub.save();

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully.',
      data: sub
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  updateSubscription
};
