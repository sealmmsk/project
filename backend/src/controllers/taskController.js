// backend/src/controllers/taskController.js
const { coordinator } = require('../agents');

const submitRobotTask = async (req, res) => {
    try {
        const { taskId, solutionCode } = req.body;
        const userId = req.user.id;

        // Отправляем задачу координатору
        coordinator.sendMessage('coordinator', { type: 'check_task', data: { userId, taskId, solutionCode } }, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Ошибка при обработке задания' });
            }
            res.json({
                success: result.success,
                score: result.score,
                feedback: result.feedback,
                nextTask: result.nextTask
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const submitTypingTask = async (req, res) => {
    res.status(501).json({ message: 'Модуль скорописи в разработке' });
};

module.exports = { submitRobotTask, submitTypingTask };