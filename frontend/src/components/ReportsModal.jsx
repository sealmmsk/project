import React, { useState, useEffect } from 'react';
import API from '../services/api';

const ReportsModal = ({ onClose }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [reportType, setReportType] = useState('performance');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/reports/classes')
      .then(res => setClasses(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setReportData(null);
      return;
    }
    setLoading(true);
    let url = '';
    if (reportType === 'performance') {
      url = `/reports/performance?classGroup=${selectedClass}`;
    } else if (reportType === 'attendance') {
      url = `/reports/attendance?classGroup=${selectedClass}`;
    } else if (reportType === 'daily') {
      url = `/reports/daily?classGroup=${selectedClass}`;
    }
    API.get(url)
      .then(res => setReportData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedClass, reportType]);

  const renderTable = () => {
    if (!reportData || reportData.length === 0) return <p>Нет данных</p>;
    if (reportType === 'performance') {
      return (
        <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr><th>Ученик</th><th>Баллы (всего)</th><th>Уровень</th><th>Логика, %</th><th>Скоропись, %</th></tr>
          </thead>
          <tbody>
            {reportData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.fullName} ({row.username})</td>
                <td>{row.totalPoints}</td>
                <td>{row.level}</td>
                <td>{row.logicMastery}</td>
                <td>{row.typingMastery}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (reportType === 'attendance') {
      return (
        <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead><tr><th>Ученик</th><th>Дата и время входа</th></tr></thead>
          <tbody>
            {reportData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.fullName} ({row.username})</td>
                <td>{new Date(row.loginTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (reportType === 'daily') {
      return (
        <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead><tr><th>Ученик</th><th>Время входа сегодня</th><th>Баллы за сегодня</th></tr></thead>
          <tbody>
            {reportData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.fullName} ({row.username})</td>
                <td>{new Date(row.loginTime).toLocaleString()}</td>
                <td>{row.todayPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Формирование отчётов</h2>
        <div>
          <label>Класс: </label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="">-- выберите --</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>Тип отчёта: </label>
          <select value={reportType} onChange={e => setReportType(e.target.value)}>
            <option value="performance">Успеваемость (баллы, уровень)</option>
            <option value="attendance">Посещаемость (входы по датам)</option>
            <option value="daily">Окончание урока (сегодня)</option>
          </select>
        </div>
        {loading && <p>Загрузка...</p>}
        {!loading && selectedClass && reportData && (
          <div style={{ marginTop: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
            {renderTable()}
          </div>
        )}
        <div style={{ marginTop: '1rem' }}>
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
  backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', width: '80%', maxWidth: '900px',
};

export default ReportsModal;