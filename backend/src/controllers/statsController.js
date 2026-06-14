const User = require('../models/User');
const StudentProgress = require('../models/StudentProgress');
const TaskResult = require('../models/TaskResult');

const getClasses = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['classGroup'],
      group: ['classGroup'],
    });
    const classes = students.map(s => s.classGroup).filter(c => c);
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения классов' });
  }
};

const getStudentsByClass = async (req, res) => {
  try {
    const { classGroup } = req.query;
    const students = await User.findAll({
      where: { role: 'student', classGroup },
      attributes: ['id', 'fullName', 'username', 'classGroup'],
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения учеников' });
  }
};

const getStudentStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    const progress = await StudentProgress.findOne({ where: { userId: studentId } });
    const tasks = await TaskResult.findAll({
      where: { userId: studentId },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    // Заглушка посещаемости (можно заменить на реальные данные позже)
    const attendance = {
      totalDays: 30,
      presentDays: Math.floor(Math.random() * 30),
    };
    res.json({
      progress: {
        totalPoints: progress?.totalPoints || 0,
        level: progress?.level || 1,
        logicMastery: progress?.logicMastery || 0,
        typingMastery: progress?.typingMastery || 0,
      },
      tasks: tasks.map(t => ({
        taskType: t.taskType,
        score: t.score,
        date: t.createdAt,
      })),
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения статистики' });
  }
};

module.exports = { getClasses, getStudentsByClass, getStudentStats };