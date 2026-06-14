import React, { useState } from 'react';
import API from '../services/api';

const RegisterTeacherModal = ({ onClose }) => {
  const [form, setForm] = useState({ lastName: '', firstName: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullName = `${form.lastName} ${form.firstName}`;
      await API.post('/admin/users', {
        username: form.username,
        fullName,
        password: form.password,
        role: 'teacher',
      });
      alert('Учитель зарегистрирован');
      onClose();
    } catch (err) {
      alert('Ошибка: ' + (err.response?.data?.message || 'попробуйте ещё раз'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Регистрация учителя</h2>
        <form onSubmit={handleSubmit}>
          <input name="lastName" placeholder="Фамилия" onChange={handleChange} required />
          <input name="firstName" placeholder="Имя" onChange={handleChange} required />
          <input name="username" placeholder="Логин" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Пароль" onChange={handleChange} required />
          <div style={{ marginTop: '1rem' }}>
            <button type="submit" disabled={loading}>Зарегистрировать</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
};
const modalStyle = {
  backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', width: '300px',
};

export default RegisterTeacherModal;