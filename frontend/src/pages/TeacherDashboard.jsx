import React, { useState, useEffect } from 'react';
import API from '../services/api';
import RegisterStudentModal from '../components/RegisterStudentModal';
import PerformanceModal from '../components/PerformanceModal';
import ReportsModal from '../components/ReportsModal'; // добавить

const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false); // добавить

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const res = await API.get('/admin/users?role=student');
    setStudents(res.data);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Код Класс – Панель учителя</h1>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => setShowStudentModal(true)}>Зарегистрировать ученика</button>
        <button onClick={() => setShowPerformanceModal(true)}>Успеваемость</button>
        <button onClick={() => setShowReportsModal(true)}>Формирование отчётов</button> {/* добавить */}
      </div>

      <h2 style={{ marginTop: '2rem' }}>Список учеников</h2>
      <ul>
        {students.map(s => (
          <li key={s.id}>{s.fullName} ({s.username}) – {s.classGroup || 'без класса'}</li>
        ))}
      </ul>

      {showStudentModal && <RegisterStudentModal onClose={() => setShowStudentModal(false)} />}
      {showPerformanceModal && <PerformanceModal onClose={() => setShowPerformanceModal(false)} />}
      {showReportsModal && <ReportsModal onClose={() => setShowReportsModal(false)} />}
    </div>
  );
};

export default TeacherDashboard;