import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RegisterTeacherModal from '../components/RegisterTeacherModal';
import RegisterStudentModal from '../components/RegisterStudentModal';
import PerformanceModal from '../components/PerformanceModal';
import ModulesModal from '../components/ModulesModal';
import ReportsModal from '../components/ReportsModal';
import UserListModal from '../components/UserListModal';

const AdminDashboard = () => {
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showModulesModal, setShowModulesModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showUserListModal, setShowUserListModal] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Код Класс – Панель администратора</h1>
        <button onClick={handleLogout}>Выйти</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => setShowTeacherModal(true)}>Зарегистрировать учителя</button>
        <button onClick={() => setShowStudentModal(true)}>Зарегистрировать ученика</button>
        <button onClick={() => setShowUserListModal(true)}>Просмотр пользователей</button>
        <button onClick={() => setShowPerformanceModal(true)}>Успеваемость</button>
        <button onClick={() => setShowModulesModal(true)}>Модули</button>
        <button onClick={() => setShowReportsModal(true)}>Формирование отчётов</button>
      </div>

      {showTeacherModal && <RegisterTeacherModal onClose={() => setShowTeacherModal(false)} />}
      {showStudentModal && <RegisterStudentModal onClose={() => setShowStudentModal(false)} />}
      {showUserListModal && <UserListModal onClose={() => setShowUserListModal(false)} />}
      {showPerformanceModal && <PerformanceModal onClose={() => setShowPerformanceModal(false)} />}
      {showModulesModal && <ModulesModal onClose={() => setShowModulesModal(false)} />}
      {showReportsModal && <ReportsModal onClose={() => setShowReportsModal(false)} />}
    </div>
  );
};

export default AdminDashboard;