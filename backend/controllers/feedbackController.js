const Feedback = require('../models/Feedback');

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback
// @access  Private (Admin)
const getAllFeedback = async (req, res, next) => {
  try {
    const { category, rating, status } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (rating) filter.rating = Number(rating);
    if (status) filter.status = status;

    const feedbacks = await Feedback.find(filter)
      .populate('student', 'name email rollNumber hostelBlock roomNumber')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const all = await Feedback.find();
    const avgRating = all.length > 0
      ? (all.reduce((acc, curr) => acc + curr.rating, 0) / all.length).toFixed(1)
      : '0.0';

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      averageRating: Number(avgRating),
      data: feedbacks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin respond to feedback & update status
// @route   PUT /api/feedback/:id/respond
// @access  Private (Admin)
const respondFeedback = async (req, res, next) => {
  try {
    const { adminResponse, status } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }

    if (adminResponse !== undefined) feedback.adminResponse = adminResponse;
    if (status) feedback.status = status;

    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Feedback response saved successfully.',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Admin)
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFeedback,
  respondFeedback,
  deleteFeedback
};
