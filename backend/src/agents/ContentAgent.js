// backend/src/agents/ContentAgent.js
const { BaseAgent } = require('./BaseAgent');

// Предопределённые уровни (можно вынести в БД)
const levels = [
    { id: 1, name: 'Уровень 1: Вверх', difficulty: 1 },
    { id: 2, name: 'Уровень 2: Вниз', difficulty: 1 },
    { id: 3, name: 'Уровень 3: Влево', difficulty: 1 },
    { id: 4, name: 'Уровень 4: Вправо', difficulty: 1 },
    { id: 5, name: 'Уровень 5: Лабиринт', difficulty: 2 }
];

class ContentAgent extends BaseAgent {
    constructor() {
        super('content');
    }

    handleMessage(msg, callback) {
        if (msg.type === 'next_task') {
            const { currentTaskId } = msg.data;
            const currentId = parseInt(currentTaskId.split('_')[1]);
            const nextLevel = levels.find(l => l.id === currentId + 1);
            if (nextLevel) {
                callback(null, { taskId: `level_${nextLevel.id}`, name: nextLevel.name });
            } else {
                callback(null, null); // нет следующего задания
            }
        } else {
            callback(new Error('Unknown message type'));
        }
    }
}

module.exports = ContentAgent;