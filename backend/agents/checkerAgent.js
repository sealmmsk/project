const Redis = require('ioredis');
const { runRobotSimulation } = require('../src/agents/checkingAgent');
const redis = new Redis();

(async () => {
    console.log('CheckerAgent started');
    while (true) {
        const task = await redis.blpop('tasks_queue', 0);
        const { taskId, solutionCode, userId } = JSON.parse(task[1]);
        console.log(`Checking task ${taskId} for user ${userId}`);
        const result = runRobotSimulation(solutionCode, parseInt(taskId.split('_')[1]));
        await redis.rpush('results_queue', JSON.stringify({ userId, taskId, result, solutionCode }));
    }
})();