// backend/src/agents/CoordinatorAgent.js
const { BaseAgent } = require('./BaseAgent');

class CoordinatorAgent extends BaseAgent {
    constructor() {
        super('coordinator');
    }

    handleMessage(msg, callback) {
        console.log(`Coordinator received: ${msg.type}`);
        switch (msg.type) {
            case 'check_task':
                this.coordinateCheckTask(msg.data, callback);
                break;
            default:
                callback(new Error('Unknown message type'));
        }
    }

    coordinateCheckTask(data, callback) {
        // data = { userId, taskId, solutionCode }
        const { userId, taskId, solutionCode } = data;

        // 1. Отправить TutorAgent на проверку
        this.sendMessage('tutor', { type: 'check', data: { solutionCode, taskId } }, (err, checkResult) => {
            if (err) return callback(err);

            // 2. Если успешно, обновить прогресс через StudentAgent
            if (checkResult.success) {
                this.sendMessage('student', { type: 'update_progress', data: { userId, score: checkResult.score } }, (err2, updateResult) => {
                    if (err2) return callback(err2);
                    // 3. Запросить следующее задание у ContentAgent
                    this.sendMessage('content', { type: 'next_task', data: { userId, currentTaskId: taskId } }, (err3, nextTask) => {
                        if (err3) return callback(err3);
                        callback(null, {
                            success: true,
                            score: checkResult.score,
                            feedback: checkResult.feedback,
                            nextTask: nextTask
                        });
                    });
                });
            } else {
                callback(null, {
                    success: false,
                    score: 0,
                    feedback: checkResult.feedback,
                    nextTask: null
                });
            }
        });
    }
}

module.exports = CoordinatorAgent;