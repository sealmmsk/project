import React, { useState, useEffect } from 'react';
import API from '../services/api';

const PerformanceModal = ({ onClose }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/stats/classes').then(res => setClasses(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      API.get(`/stats/students?classGroup=${selectedClass}`)
        .then(res => setStudents(res.data))
        .catch(console.error);
    } else {
      setStudents([]);
    }
    setSelectedStudent('');
    setStats(null);
  }, [selectedClass]);

  useEffect(() => {
    if (selectedStudent) {
      setLoading(true);
      API.get(`/stats/students/${selectedStudent}/stats`)
        .then(res => setStats(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedStudent]);

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, width: '600px' }}>
        <h2>Успеваемость</h2>
        <div>
          <label>Класс: </label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">-- выберите --</option>
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        {selectedClass && (
          <div style={{ marginTop: '1rem' }}>
            <label>Ученик: </label>
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
              <option value="">-- выберите --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.username})</option>)}
            </select>
          </div>
        )}
        {loading && <div>Загрузка...</div>}
        {stats && (
          <div style={{ marginTop: '1rem' }}>
            <h3>Статистика</h3>
            <p><strong>Прогресс:</strong></p>
            <ul>
              <li>Баллы: {stats.progress.totalPoints}</li>
              <li>Уровень: {stats.progress.level}</li>
              <li>Логика: {stats.progress.logicMastery}%</li>
              <li>Скоропись: {stats.progress.typingMastery}%</li>
            </ul>
            <p><strong>Посещаемость (30 дней):</strong> {stats.attendance.presentDays} / {stats.attendance.totalDays} ({Math.round(stats.attendance.presentDays/stats.attendance.totalDays*100)}%)</p>
            <p><strong>Последние задания:</strong></p>
            <ul>
              {stats.tasks.map((t, idx) => (
                <li key={idx}>{t.taskType === 'robot' ? 'Робот' : 'Скоропись'}: {t.score} баллов ({new Date(t.date).toLocaleDateString()})</li>
              ))}
            </ul>
          </div>
        )}
        <div style={{ marginTop: '2rem' }}>
          <button onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
};
const modalStyle = {
  backgroundColor: '#fff', padding: '2rem', borderRadius: '8px',
};

export default PerformanceModal;