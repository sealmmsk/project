const levels = {
  1: { size: 10, start: { x: 3, y: 5 }, goal: { x: 3, y: 4 }, walls: [] },
  2: { size: 10, start: { x: 3, y: 4 }, goal: { x: 3, y: 5 }, walls: [] },
  3: { size: 10, start: { x: 3, y: 3 }, goal: { x: 2, y: 3 }, walls: [] },
  4: { size: 10, start: { x: 3, y: 3 }, goal: { x: 4, y: 3 }, walls: [] },
  5: { size: 10, start: { x: 2, y: 2 }, goal: { x: 7, y: 7 }, walls: [[4,3],[4,4],[5,4],[5,5]] },
};

const runRobotSimulation = (code, levelId) => {
  const level = levels[levelId];
  if (!level) return { success: false, score: 0, message: 'Уровень не найден' };

  let robot = { ...level.start };
  const wallsSet = new Set(level.walls.map(w => `${w[0]},${w[1]}`));

  const moveRobotUp = () => { robot.y -= 1; };
  const moveRobotDown = () => { robot.y += 1; };
  const moveRobotLeft = () => { robot.x -= 1; };
  const moveRobotRight = () => { robot.x += 1; };

  const lines = code.split('\n').filter(line => line.includes('moveRobot'));
  try {
    for (const line of lines) {
      const fn = new Function('moveRobotUp', 'moveRobotDown', 'moveRobotLeft', 'moveRobotRight', line);
      fn(moveRobotUp, moveRobotDown, moveRobotLeft, moveRobotRight);
      if (robot.x < 0 || robot.x >= level.size || robot.y < 0 || robot.y >= level.size) {
        return { success: false, score: 0, message: 'Робот вышел за границы поля' };
      }
      if (wallsSet.has(`${robot.x},${robot.y}`)) {
        return { success: false, score: 0, message: 'Робот врезался в стену' };
      }
    }
  } catch (err) {
    return { success: false, score: 0, message: 'Ошибка выполнения программы' };
  }

  if (robot.x === level.goal.x && robot.y === level.goal.y) {
    return { success: true, score: 100, message: 'Уровень пройден! Начислено 100 баллов.' };
  } else {
    return { success: false, score: 0, message: 'Робот не дошёл до цели' };
  }
};

module.exports = { runRobotSimulation };