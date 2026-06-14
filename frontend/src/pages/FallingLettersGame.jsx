import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const W = 800, H = 500;
const MAX_MISS = 3;

// РУССКИЕ уровни (простые буквы, слоги, слова)
const levels = [
  { name: 'Русские буквы 1 (левая рука)', chars: ['а','в','п','р','о'], speed: 1.2, spawn: 45, points: 5 },
  { name: 'Русские буквы 2 (правая рука)', chars: ['и','т','ь','б','ю'], speed: 1.2, spawn: 45, points: 5 },
  { name: 'Русские буквы (обе руки)', chars: ['ф','ы','в','а','п','р','о','л','д','ж','я','ч','с','м','и','т','ь','б','ю'], speed: 1.5, spawn: 40, points: 5 },
  { name: 'Слоги', chars: ['ма','па','ра','та','ла','ка','но','во'], speed: 1.8, spawn: 50, points: 10 },
  { name: 'Короткие слова', chars: ['дом','кот','лес','сад','мир','сон','лук','зуб'], speed: 2.2, spawn: 55, points: 15 },
  { name: 'Средние слова', chars: ['мама','папа','рука','нога','дверь','стол','стул'], speed: 2.6, spawn: 60, points: 20 },
];

const STORAGE_KEY = 'falling_game';

const FallingLettersGame = () => {
  const navigate = useNavigate();
  const canvas = useRef(null);
  const [gameActive, setGameActive] = useState(false);
  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [msg, setMsg] = useState('');
  const [showTut, setShowTut] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const items = useRef([]);
  const frame = useRef(0);
  const interval = useRef(null);
  const gameActiveRef = useRef(false); // для доступа из setInterval

  // Загрузка сохранённого прогресса
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { level: lvl, score: scr } = JSON.parse(saved);
        setLevelIdx(lvl);
        setScore(scr);
      } catch(e) {}
    }
    if (!localStorage.getItem('fall_tut_ru_final')) setShowTut(true);
  }, []);

  // Сохранение прогресса (только когда игра активна)
  useEffect(() => {
    if (gameActive) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ level: levelIdx, score }));
    }
  }, [levelIdx, score, gameActive]);

  const startGame = () => {
    setGameActive(true);
    gameActiveRef.current = true;
    setMsg('');
    items.current = [];
    frame.current = 0;
    if (interval.current) clearInterval(interval.current);
    interval.current = setInterval(() => {
      if (!gameActiveRef.current) return; // используем реф для актуального состояния
      const lvl = levels[levelIdx];
      // 1. Движение и удаление упавших
      for (let i = 0; i < items.current.length; i++) {
        items.current[i].y += lvl.speed;
        if (items.current[i].y >= H - 40) {
          items.current.splice(i, 1);
          i--;
          setMisses(m => {
            const nm = m + 1;
            if (nm >= MAX_MISS) {
              gameActiveRef.current = false;
              setGameActive(false);
              setMsg('Поражение! Прогресс сохранён.');
              if (interval.current) clearInterval(interval.current);
            }
            return nm;
          });
        }
      }
      // 2. Генерация новых объектов
      frame.current++;
      if (frame.current % lvl.spawn === 0) {
        const word = lvl.chars[Math.floor(Math.random() * lvl.chars.length)];
        const x = 30 + Math.random() * (W - 100);
        items.current.push({ text: word, x, y: 20 });
      }
      // 3. Отрисовка
      const ctx = canvas.current.getContext('2d');
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#eee';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '28px monospace';
      ctx.fillStyle = 'black';
      items.current.forEach(it => ctx.fillText(it.text, it.x, it.y));
      ctx.font = '18px Arial';
      ctx.fillStyle = 'darkblue';
      ctx.fillText(`${lvl.name}  Очки:${score}  Пропуски:${misses}/${MAX_MISS}`, 10, 30);
      // 4. Проверка перехода на следующий уровень
      const requiredScore = (levelIdx + 1) * 200;
      if (score >= requiredScore && levelIdx + 1 < levels.length) {
        setLevelIdx(levelIdx + 1);
        setMsg(`Уровень ${levels[levelIdx + 1].name}!`);
        setTimeout(() => setMsg(''), 1500);
      } else if (score >= requiredScore && levelIdx + 1 === levels.length) {
        gameActiveRef.current = false;
        setGameActive(false);
        setMsg('Победа! Все уровни пройдены!');
        if (interval.current) clearInterval(interval.current);
      }
    }, 1000 / 60);
  };

  useEffect(() => {
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, []);

  // Обработка нажатий клавиш
  useEffect(() => {
    const onKey = (e) => {
      if (!gameActive) return;
      const key = e.key.toLowerCase();
      for (let i = 0; i < items.current.length; i++) {
        const it = items.current[i];
        if (it.text.length === 1 && key === it.text) {
          items.current.splice(i, 1);
          setScore(s => s + levels[levelIdx].points);
          break;
        } else if (it.text.length > 1 && key === it.text[0]) {
          it.text = it.text.slice(1);
          if (it.text === '') {
            items.current.splice(i, 1);
            setScore(s => s + levels[levelIdx].points);
          }
          break;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameActive, levelIdx]);

  const resetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLevelIdx(0);
    setScore(0);
    setMisses(0);
    if (interval.current) clearInterval(interval.current);
    gameActiveRef.current = false;
    setGameActive(false);
    setMsg('Прогресс сброшен');
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Кнопки всегда сверху */}
      <button onClick={() => { if (interval.current) clearInterval(interval.current); navigate('/dashboard'); }} style={{ position: 'fixed', top: 10, left: 10, zIndex: 1001 }}>🏠 На главный</button>
      <button onClick={resetProgress} style={{ position: 'fixed', top: 50, left: 10, zIndex: 1001 }}>🔄 Сброс прогресса</button>

      <div style={{ position: 'fixed', bottom: 20, right: 20, width: showHint ? 260 : 'auto', background: 'white', border: '1px solid gray', borderRadius: 8, zIndex: 1000 }}>
        <div onClick={() => setShowHint(!showHint)} style={{ background: '#f0f0f0', padding: '8px 12px', cursor: 'pointer' }}>📘 Инструкция {showHint ? '▼' : '▲'}</div>
        {showHint && <div style={{ padding: 12, fontSize: 14 }}><ul><li>Русская раскладка!</li><li>Нажимайте русские буквы</li><li>Слова сбиваются по первой букве</li><li>3 пропуска = конец</li><li>Прогресс сохраняется автоматически</li></ul></div>}
      </div>

      {showTut && (
        <div style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
          <div style={{ background:'white', padding:24, borderRadius:12, maxWidth:500 }}>
            <h2>⌨️ Тренажёр «Падающие буквы»</h2>
            <p><strong>Важно!</strong> Для игры <strong>переключите клавиатуру на русскую раскладку</strong>. Нажимайте русские буквы, которые падают. Для слов достаточно первой буквы. Прогресс сохраняется автоматически.</p>
            <button onClick={() => { setShowTut(false); localStorage.setItem('fall_tut_ru_final','1'); }} style={{ marginTop:16, padding:'8px 24px', cursor:'pointer' }}>Понятно, начать!</button>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', padding: 16 }}>
        <h2>Падающие буквы (русские)</h2>
        {!gameActive && !msg && <button onClick={startGame}>Начать игру (с сохранённого уровня)</button>}
        <canvas ref={canvas} width={W} height={H} style={{ border: '1px solid black', marginTop: 16 }} />
        {msg && <div>{msg}</div>}
        {!gameActive && msg && <button onClick={startGame}>Сыграть ещё</button>}
      </div>
    </div>
  );
};

export default FallingLettersGame;