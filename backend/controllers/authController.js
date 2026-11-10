const User = require('../models/User');
const Subscription = require('../models/Subscription');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (defaults to student)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
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
      role,
      adminSecret
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Check roll number uniqueness if provided
    if (rollNumber) {
      const rollExists = await User.findOne({ rollNumber: rollNumber.toUpperCase() });
      if (rollExists) {
        return res.status(400).json({
          success: false,
          message: 'A student with this roll number is already registered.'
        });
      }
    }

    // Role assignment check
    let userRole = 'student';
    if (role === 'admin') {
      const expectedSecret = process.env.ADMIN_REGISTRATION_SECRET || 'ADMIN_MESS_KEY_2026';
      if (adminSecret !== expectedSecret) {
        return res.status(403).json({
          success: false,
          message: 'Invalid Admin Registration Secret key.'
        });
      }
      userRole = 'admin';
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      rollNumber: rollNumber ? rollNumber.toUpperCase() : undefined,
      roomNumber: roomNumber || 'N/A',
      hostelBlock: hostelBlock || 'Block A',
      phone: phone || '',
      department: department || 'General Engineering',
      year: year || 1,
      dietaryPreference: dietaryPreference || 'Veg',
      status: 'active'
    });

    // If student, create default active subscription
    if (user.role === 'student') {
      await Subscription.create({
        student: user._id,
        planName: 'Standard Monthly All-Meals',
        monthlyFee: 4200,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        mealsIncluded: ['Breakfast', 'Lunch', 'Snacks', 'Dinner']
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        roomNumber: user.roomNumber,
        hostelBlock: user.hostelBlock,
        department: user.department,
        year: user.year,
        dietaryPreference: user.dietaryPreference
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Find user by email and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account is currently ${user.status}. Please contact the mess administration.`
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        roomNumber: user.roomNumber,
        hostelBlock: user.hostelBlock,
        phone: user.phone,
        department: user.department,
        year: user.year,
        dietaryPreference: user.dietaryPreference
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let subscription = null;

    if (user.role === 'student') {
      subscription = await Subscription.findOne({ student: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      roomNumber,
      hostelBlock,
      department,
      year,
      dietaryPreference,
      avatar
    } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (roomNumber) fieldsToUpdate.roomNumber = roomNumber;
    if (hostelBlock) fieldsToUpdate.hostelBlock = hostelBlock;
    if (department) fieldsToUpdate.department = department;
    if (year) fieldsToUpdate.year = year;
    if (dietaryPreference) fieldsToUpdate.dietaryPreference = dietaryPreference;
    if (avatar !== undefined) fieldsToUpdate.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
