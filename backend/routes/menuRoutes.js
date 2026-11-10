const express = require('express');
const router = express.Router();
const {
  getWeeklyMenu,
  getTodayMenu,
  createOrUpdateMenu,
  updateMenuById,
  deleteMenuById
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getWeeklyMenu);
router.get('/today', getTodayMenu);

// Admin-only operations
router.post('/', protect, authorize('admin'), createOrUpdateMenu);
router.put('/:id', protect, authorize('admin'), updateMenuById);
router.delete('/:id', protect, authorize('admin'), deleteMenuById);

module.exports = router;
