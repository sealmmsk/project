import React from 'react';
import { useNavigate } from 'react-router-dom';

const ModulesModal = ({ onClose }) => {
  const navigate = useNavigate();

  const goToRobot = () => {
    navigate('/robot');
    onClose();
  };

  const goToTyping = () => {
    alert('Модуль скорописи в разработке');
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Модули обучения</h2>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={goToRobot}>Робот</button>
          <button onClick={goToTyping}>Скоропись</button>
        </div>
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
  backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', textAlign: 'center',
};

export default ModulesModal;