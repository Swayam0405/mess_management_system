const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  updateSubscription
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentById);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.put('/subscriptions/:studentId', updateSubscription);

module.exports = router;
