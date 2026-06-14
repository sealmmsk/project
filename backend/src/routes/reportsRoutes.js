const express = require('express');
const { getClasses, getPerformanceReport, getAttendanceReport, getDailyReport } = require('../controllers/reportsController');
const { authMiddleware, isAdminOrTeacher } = require('../middleware/auth');

const router = express.Router();

router.get('/classes', authMiddleware, isAdminOrTeacher, getClasses);
router.get('/performance', authMiddleware, isAdminOrTeacher, getPerformanceReport);
router.get('/attendance', authMiddleware, isAdminOrTeacher, getAttendanceReport);
router.get('/daily', authMiddleware, isAdminOrTeacher, getDailyReport);

module.exports = router;