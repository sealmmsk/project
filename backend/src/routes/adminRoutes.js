const express = require('express');
const { getUsers, createUser, deleteUser } = require('../controllers/adminController');
const { authMiddleware, isAdmin, isAdminOrTeacher } = require('../middleware/auth');

const router = express.Router();

// Получить список пользователей (только админ или учитель)
router.get('/users', authMiddleware, isAdminOrTeacher, getUsers);
// Создать пользователя (только админ или учитель)
router.post('/users', authMiddleware, isAdminOrTeacher, createUser);
// Удалить пользователя (только админ)
router.delete('/users/:id', authMiddleware, isAdmin, deleteUser);

module.exports = router;