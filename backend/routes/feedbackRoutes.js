const express = require('express');
const router = express.Router();
const {
  getAllFeedback,
  respondFeedback,
  deleteFeedback
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllFeedback);
router.put('/:id/respond', respondFeedback);
router.delete('/:id', deleteFeedback);

module.exports = router;
