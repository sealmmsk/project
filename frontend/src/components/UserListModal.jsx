import React, { useState, useEffect } from 'react';
import API from '../services/api';

const UserListModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('teachers');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [teachersRes, studentsRes] = await Promise.all([
        API.get('/admin/users?role=teacher'),
        API.get('/admin/users?role=student'),
      ]);
      setTeachers(teachersRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error('Ошибка загрузки пользователей', err);
      alert('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Удалить пользователя "${userName}"? Это действие необратимо.`)) {
      try {
        await API.delete(`/admin/users/${userId}`);
        alert('Пользователь удалён');
        fetchUsers(); // обновляем списки
      } catch (err) {
        alert('Ошибка удаления: ' + (err.response?.data?.message || 'попробуйте ещё раз'));
      }
    }
  };

  const renderList = (users, type) => (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {users.map(user => (
        <li key={user.id} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>{user.fullName}</strong> (логин: {user.username}) {type === 'student' && ` — класс: ${user.classGroup || 'не указан'}`}</span>
          <button onClick={() => handleDelete(user.id, user.fullName)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Удалить</button>
        </li>
      ))}
    </ul>
  );

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, width: '600px' }}>
        <h2>Управление пользователями</h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button onClick={() => setActiveTab('teachers')} style={{ fontWeight: activeTab === 'teachers' ? 'bold' : 'normal' }}>Учителя ({teachers.length})</button>
          <button onClick={() => setActiveTab('students')} style={{ fontWeight: activeTab === 'students' ? 'bold' : 'normal' }}>Ученики ({students.length})</button>
        </div>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <>
            {activeTab === 'teachers' && (
              teachers.length === 0 ? <p>Нет зарегистрированных учителей.</p> : renderList(teachers, 'teacher')
            )}
            {activeTab === 'students' && (
              students.length === 0 ? <p>Нет зарегистрированных учеников.</p> : renderList(students, 'student')
            )}
          </>
        )}
        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
          <button onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000,
};
const modalStyle = {
  backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', maxHeight: '80vh', overflowY: 'auto',
};

export default UserListModal;