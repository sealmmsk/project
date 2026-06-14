const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware для проверки JWT токена (авторизация)
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Нет токена. Доступ запрещён.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Неверный или просроченный токен' });
  }
};

// Middleware для проверки прав администратора
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Доступ только для администратора' });
  }
};

// Middleware для проверки прав администратора или учителя
const isAdminOrTeacher = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
    next();
  } else {
    res.status(403).json({ message: 'Недостаточно прав' });
  }
};

module.exports = { authMiddleware, isAdmin, isAdminOrTeacher };