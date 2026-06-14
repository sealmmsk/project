const { Op } = require('sequelize');
const User = require('../models/User');
const StudentProgress = require('../models/StudentProgress');
const TaskResult = require('../models/TaskResult');
const Attendance = require('../models/Attendance');

// Получить список классов
const getClasses = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['classGroup'],
      group: ['classGroup'],
    });
    const classes = students.map(s => s.classGroup).filter(c => c && c !== null);
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения классов' });
  }
};

// Отчёт по успеваемости (одна строка на ученика)
const getPerformanceReport = async (req, res) => {
  try {
    const { classGroup } = req.query;
    const students = await User.findAll({
      where: { role: 'student', classGroup },
      attributes: ['id', 'fullName', 'username', 'classGroup'],
    });
    const result = [];
    for (const student of students) {
      const progress = await StudentProgress.findOne({ where: { userId: student.id } });
      result.push({
        fullName: student.fullName,
        username: student.username,
        totalPoints: progress ? progress.totalPoints : 0,
        level: progress ? progress.level : 1,
        logicMastery: progress ? progress.logicMastery : 0,
        typingMastery: progress ? progress.typingMastery : 0,
      });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения успеваемости' });
  }
};

// Отчёт по посещаемости (список входов с датами)
const getAttendanceReport = async (req, res) => {
  try {
    const { classGroup, startDate, endDate } = req.query;
    const students = await User.findAll({
      where: { role: 'student', classGroup },
      attributes: ['id', 'fullName', 'username'],
    });
    const studentIds = students.map(s => s.id);
    const whereClause = { userId: studentIds };
    if (startDate && endDate) {
      whereClause.loginTime = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    const visits = await Attendance.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ['fullName', 'username'] }],
      order: [['loginTime', 'DESC']],
    });
    const formatted = visits.map(v => ({
      fullName: v.User.fullName,
      username: v.User.username,
      loginTime: v.loginTime,
      date: v.date,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения посещаемости' });
  }
};

// Отчёт "Окончание урока" – ученики, заходившие сегодня, с баллами за сегодня
const getDailyReport = async (req, res) => {
  try {
    const { classGroup } = req.query;
    const today = new Date().toISOString().slice(0,10);
    const students = await User.findAll({
      where: { role: 'student', classGroup },
      attributes: ['id', 'fullName', 'username'],
    });
    const studentIds = students.map(s => s.id);
    // Посещаемость за сегодня
    const todayVisits = await Attendance.findAll({
      where: { userId: studentIds, date: today },
      include: [{ model: User, attributes: ['fullName', 'username'] }],
    });
    // Баллы, набранные сегодня (суммарно за все задания сегодня)
    const todayScores = await TaskResult.findAll({
      where: { userId: studentIds, createdAt: { [Op.gte]: new Date(today) } },
      attributes: ['userId', 'score'],
    });
    const scoreMap = {};
    todayScores.forEach(ts => {
      scoreMap[ts.userId] = (scoreMap[ts.userId] || 0) + ts.score;
    });
    const result = todayVisits.map(visit => ({
      fullName: visit.User.fullName,
      username: visit.User.username,
      loginTime: visit.loginTime,
      todayPoints: scoreMap[visit.userId] || 0,
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения отчёта за день' });
  }
};

module.exports = { getClasses, getPerformanceReport, getAttendanceReport, getDailyReport };