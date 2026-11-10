const Announcement = require('../models/Announcement');

// @desc    Get all active announcements
// @route   GET /api/announcements
// @access  Public / Private
const getAnnouncements = async (req, res, next) => {
  try {
    const { category, priority, all } = req.query;
    const filter = {};

    // If 'all' is not requested, return only active announcements
    if (all !== 'true') {
      filter.isActive = true;
    }

    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const announcements = await Announcement.find(filter)
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin create announcement
// @route   POST /api/announcements
// @access  Private (Admin)
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, priority, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required.'
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'General',
      priority: priority || 'medium',
      author: req.user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin)
const updateAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, priority, isActive, expiresAt } = req.body;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.'
      });
    }

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (category) announcement.category = category;
    if (priority) announcement.priority = priority;
    if (isActive !== undefined) announcement.isActive = isActive;
    if (expiresAt !== undefined) announcement.expiresAt = expiresAt ? new Date(expiresAt) : null;

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin)
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};
