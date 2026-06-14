import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    API.get('/auth/me')
      .then(res => setProgress(res.data.user.StudentProgress))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Код Класс – Привет, {user.fullName}!</h1>
      <p>Роль: Ученик</p>
      {progress ? (
        <div>
          <h3>Твой прогресс</h3>
          <p>⭐ Очки: {progress.totalPoints}</p>
          <p>📈 Уровень: {progress.level}</p>
          <p>🤖 Логика: {progress.logicMastery}%</p>
          <p>⌨️ Скоропись: {progress.typingMastery}%</p>
        </div>
      ) : (
        <p>Загрузка прогресса...</p>
      )}
      <div>
        <h3>Учебные модули</h3>
        <Link to="/robot">
          <button style={{ marginRight: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>🤖 Робот</button>
        </Link>
        <Link to="/falling-letters">
          <button style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>⌨️ Падающие буквы</button>
        </Link>
      </div>
      <button onClick={logout} style={{ marginTop: '2rem' }}>Выйти</button>
    </div>
  );
};

export default StudentDashboard;