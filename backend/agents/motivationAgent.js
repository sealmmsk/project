const Redis = require('ioredis');
const { StudentProgress, TaskResult } = require('../src/models');
const redis = new Redis();

(async () => {
    console.log('MotivationAgent started');
    while (true) {
        const msg = await redis.blpop('results_queue', 0);
        const { userId, taskId, result, solutionCode } = JSON.parse(msg[1]);
        if (result.success) {
            const progress = await StudentProgress.findOne({ where: { userId } });
            if (progress) {
                await progress.update({
                    totalPoints: progress.totalPoints + result.score,
                    logicMastery: Math.min(100, progress.logicMastery + 5),
                });
            }
        }
        await TaskResult.create({
            userId,
            taskType: 'robot',
            taskId,
            score: result.score,
            details: { solutionCode, feedback: result.message },
        });
        console.log(`Updated progress for user ${userId}, score +${result.score}`);
    }
})();