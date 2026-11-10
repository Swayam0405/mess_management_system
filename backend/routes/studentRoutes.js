const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getPaymentHistory,
  makePayment,
  submitFeedback,
  getMyFeedback,
  markAttendance,
  getAttendanceHistory
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/payments', getPaymentHistory);
router.post('/pay', makePayment);
router.post('/feedback', submitFeedback);
router.get('/feedback', getMyFeedback);
router.post('/attendance', markAttendance);
router.get('/attendance', getAttendanceHistory);

module.exports = router;
