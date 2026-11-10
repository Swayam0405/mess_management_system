const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  deletePayment
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin'), getAllPayments);
router.get('/:id', getPaymentById);
router.post('/', authorize('admin'), createPayment);
router.put('/:id', authorize('admin'), updatePaymentStatus);
router.delete('/:id', authorize('admin'), deletePayment);

module.exports = router;
