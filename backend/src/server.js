require('./agents');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sequelize = require('./config/db');

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const taskRoutes = require('./routes/taskRoutes');
const statsRoutes = require('./routes/statsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/reports', reportsRoutes);

// Простой маршрут для проверки работы API
app.get('/api', (req, res) => {
  res.json({ message: 'Код Класс API работает' });
});

// ------------------ Раздача статики фронтенда ------------------
const distPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Все остальные GET-запросы (кроме /api) направляем на index.html
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('⚠️ Папка frontend/dist не найдена. Соберите фронтенд: cd frontend && npm run build');
  app.get('/', (req, res) => {
    res.send('Соберите фронтенд командой npm run build в папке frontend');
  });
}
// -------------------------------------------------------------

// Функция запуска сервера
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ База данных подключена');

    // Синхронизация моделей (создание/обновление таблиц)
    await sequelize.sync({ alter: true });
    console.log('✅ Модели синхронизированы');

    // Создание администратора, если не существует
    const User = require('./models/User');
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        fullName: 'Системный администратор',
        email: 'admin@example.com',
        passwordHash: 'admin',
        role: 'admin',
      });
      console.log('✅ Создан администратор: admin / admin');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
  }
};

start();