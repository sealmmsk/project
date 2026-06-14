const User = require('../models/User');
const StudentProgress = require('../models/StudentProgress');
const TaskResult = require('../models/TaskResult');

// Получить всех пользователей (с возможной фильтрацией по роли)
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    const users = await User.findAll({ where, attributes: { exclude: ['passwordHash'] } });
    res.json(users);
  } catch (error) {
    console.error('Ошибка getUsers:', error);
    res.status(500).json({ message: 'Ошибка получения пользователей' });
  }
};

// Создать пользователя (админ или учитель)
const createUser = async (req, res) => {
  try {
    const { username, fullName, email, password, role, classGroup } = req.body;
    console.log('Получены данные для создания:', { username, fullName, email, role, classGroup });

    // Проверка прав: учитель не может создать администратора
    if (req.user.role === 'teacher' && role === 'admin') {
      return res.status(403).json({ message: 'Учитель не может создавать администраторов' });
    }

    // Проверка уникальности логина
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ message: 'Логин уже занят' });
    }

    const user = await User.create({
      username,
      fullName,
      email: email || null,
      passwordHash: password,
      role: role || 'student',
      classGroup: (role === 'student') ? classGroup : null,
    });

    if (user.role === 'student') {
      await StudentProgress.create({ userId: user.id });
    }

    res.status(201).json({
      message: 'Пользователь создан',
      user: { id: user.id, username, fullName, role }
    });
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    res.status(500).json({ message: 'Ошибка создания пользователя: ' + error.message });
  }
};

// Удалить пользователя (только для администратора)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    // Запрещаем удалять самого себя
    if (user.id === req.user.id) {
      return res.status(403).json({ message: 'Нельзя удалить свою учётную запись' });
    }
    // Если это ученик, удаляем связанные записи прогресса и результатов
    if (user.role === 'student') {
      await StudentProgress.destroy({ where: { userId: user.id } });
      await TaskResult.destroy({ where: { userId: user.id } });
    }
    await user.destroy();
    res.json({ message: 'Пользователь удалён' });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ message: 'Ошибка удаления пользователя' });
  }
};

module.exports = { getUsers, createUser, deleteUser };