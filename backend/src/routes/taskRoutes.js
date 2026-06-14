const express = require('express');
const { submitRobotTask, submitTypingTask } = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/robot', authMiddleware, submitRobotTask);
router.post('/typing', authMiddleware, submitTypingTask);

module.exports = router;