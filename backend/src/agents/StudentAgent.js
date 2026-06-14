// backend/src/agents/StudentAgent.js
const { BaseAgent } = require('./BaseAgent');
const { StudentProgress } = require('../models'); // предполагаем, что модель уже есть

class StudentAgent extends BaseAgent {
    constructor() {
        super('student');
    }

    async handleMessage(msg, callback) {
        if (msg.type === 'update_progress') {
            const { userId, score } = msg.data;
            try {
                let progress = await StudentProgress.findOne({ where: { userId } });
                if (!progress) {
                    progress = await StudentProgress.create({ userId });
                }
                await progress.update({
                    totalPoints: progress.totalPoints + score,
                    logicMastery: Math.min(100, progress.logicMastery + 5)
                });
                callback(null, { success: true, newTotal: progress.totalPoints });
            } catch (err) {
                callback(err);
            }
        } else {
            callback(new Error('Unknown message type'));
        }
    }
}

module.exports = StudentAgent;