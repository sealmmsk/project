// backend/src/agents/CoordinatorAgent.js
const { BaseAgent } = require('./BaseAgent');

class CoordinatorAgent extends BaseAgent {
    constructor() {
        super('coordinator');
    }

    decide(msg) {
        console.log(`[Coordinator] принимает решение по ${msg.type}`);
        return msg;
    }

    coordinateCheckTask(data, callback) {
        const { userId, taskId, solutionCode } = data;

        this.sendMessage('tutor', { 
            type: 'check', 
            data: { solutionCode, taskId } 
        }, (err, checkResult) => {
            if (err) return callback(err);

            if (checkResult.success) {
                this.sendMessage('student', { 
                    type: 'update_progress', 
                    data: { userId, score: checkResult.score } 
                }, (err2, updateResult) => {
                    if (err2) return callback(err2);

                    this.sendMessage('content', { 
                        type: 'next_task', 
                        data: { userId, currentTaskId: taskId } 
                    }, (err3, nextTask) => {
                        if (err3) return callback(err3);
                        callback(null, {
                            success: true,
                            score: checkResult.score,
                            feedback: checkResult.feedback,
                            nextTask
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

    handleMessage(msg, callback) {
        if (msg.type === 'check_task') {
            this.coordinateCheckTask(msg.data, callback);
        } else {
            callback(new Error('Unknown message type'));
        }
    }
}

module.exports = CoordinatorAgent;