const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProgress = require('../models/StudentProgress');
const Attendance = require('../models/Attendance'); // добавить

const register = async (req, res) => {
  try {
    const { username, fullName, email, password, role, classGroup } = req.body;
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ message: 'Логин уже занят' });
    }
    const user = await User.create({
      username,
      fullName,
      email,
      passwordHash: password,
      role: role || 'student',
      classGroup,
    });
    if (user.role === 'student') {
      await StudentProgress.create({ userId: user.id });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, username, fullName, role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }
    // Если ученик – фиксируем посещаемость (только при входе)
    if (user.role === 'student') {
      await Attendance.create({
        userId: user.id,
        loginTime: new Date(),
        date: new Date().toISOString().slice(0,10),
      });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username, fullName: user.fullName, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: StudentProgress }],
    });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = { register, login, me };