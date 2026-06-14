const express = require('express');
const { getClasses, getStudentsByClass, getStudentStats } = require('../controllers/statsController');
const { authMiddleware, isAdminOrTeacher } = require('../middleware/auth');

const router = express.Router();

router.get('/classes', authMiddleware, isAdminOrTeacher, getClasses);
router.get('/students', authMiddleware, isAdminOrTeacher, getStudentsByClass);
router.get('/students/:studentId/stats', authMiddleware, isAdminOrTeacher, getStudentStats);

module.exports = router;