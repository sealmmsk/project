// backend/src/agents/TutorAgent.js
const { BaseAgent } = require('./BaseAgent');
const { runRobotSimulation } = require('./checkingAgent'); // используем существующую функцию

class TutorAgent extends BaseAgent {
    constructor() {
        super('tutor');
    }

    handleMessage(msg, callback) {
        if (msg.type === 'check') {
            const { solutionCode, taskId } = msg.data;
            const levelId = parseInt(taskId.split('_')[1]);
            const result = runRobotSimulation(solutionCode, levelId);
            // Добавляем обратную связь
            const feedback = result.success ? result.message : `Ошибка: ${result.message}`;
            callback(null, {
                success: result.success,
                score: result.score,
                feedback: feedback
            });
        } else {
            callback(new Error('Unknown message type'));
        }
    }
}

module.exports = TutorAgent;