import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import 'blockly/javascript';
import API from '../services/api';

const CELL_SIZE = 40;
const GRID_SIZE = 10;

Blockly.defineBlocksWithJsonArray([
  { type: 'robot_move_up', message0: 'Вверх', previousStatement: null, nextStatement: null, colour: 160 },
  { type: 'robot_move_down', message0: 'Вниз', previousStatement: null, nextStatement: null, colour: 160 },
  { type: 'robot_move_left', message0: 'Влево', previousStatement: null, nextStatement: null, colour: 160 },
  { type: 'robot_move_right', message0: 'Вправо', previousStatement: null, nextStatement: null, colour: 160 },
]);

Blockly.JavaScript['robot_move_up'] = () => 'moveRobotUp();\n';
Blockly.JavaScript['robot_move_down'] = () => 'moveRobotDown();\n';
Blockly.JavaScript['robot_move_left'] = () => 'moveRobotLeft();\n';
Blockly.JavaScript['robot_move_right'] = () => 'moveRobotRight();\n';

const levels = [
  { id: 1, name: 'Урок 1: Вверх', start: { x: 3, y: 5 }, goal: { x: 3, y: 4 }, walls: [] },
  { id: 2, name: 'Урок 2: Вниз', start: { x: 3, y: 4 }, goal: { x: 3, y: 5 }, walls: [] },
  { id: 3, name: 'Урок 3: Влево', start: { x: 3, y: 3 }, goal: { x: 2, y: 3 }, walls: [] },
  { id: 4, name: 'Урок 4: Вправо', start: { x: 3, y: 3 }, goal: { x: 4, y: 3 }, walls: [] },
  { id: 5, name: 'Лабиринт 1', start: { x: 2, y: 2 }, goal: { x: 7, y: 7 }, walls: [[4,3],[4,4],[5,4],[5,5]] },
];

const RobotGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const blocklyDivRef = useRef(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [robotPos, setRobotPos] = useState(levels[0].start);
  const [message, setMessage] = useState('');
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [completedLevels, setCompletedLevels] = useState([]);

  // Флаг для предотвращения двойной инициализации Blockly
  const isBlocklyInitialized = useRef(false);

  // Загрузка пройденных уровней из БД
  useEffect(() => {
    API.get('/auth/me')
      .then(res => {
        const progress = res.data.user.StudentProgress;
        if (progress && progress.completedLevels) {
          const completed = JSON.parse(progress.completedLevels);
          setCompletedLevels(completed);
          // Начинаем с первого непройденного уровня
          let firstUncompleted = 0;
          for (let i = 0; i < levels.length; i++) {
            if (!completed.includes(levels[i].id)) {
              firstUncompleted = i;
              break;
            }
          }
          setCurrentLevel(firstUncompleted);
          setRobotPos(levels[firstUncompleted].start);
        }
      })
      .catch(console.error);
  }, []);

  // Туториал
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('robot_tutorial_seen');
    if (!hasSeenTutorial) setShowTutorial(true);
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('robot_tutorial_seen', 'true');
  };

  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const level = levels[currentLevel];
    canvas.width = GRID_SIZE * CELL_SIZE;
    canvas.height = GRID_SIZE * CELL_SIZE;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvas.height);
      ctx.stroke();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    ctx.fillStyle = '#888';
    level.walls.forEach(([x, y]) => {
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });

    ctx.font = `${CELL_SIZE * 0.6}px Arial`;
    ctx.fillStyle = '#2e7d32';
    ctx.fillText('Ц', level.goal.x * CELL_SIZE + CELL_SIZE * 0.25, level.goal.y * CELL_SIZE + CELL_SIZE * 0.7);
    ctx.fillStyle = '#1565c0';
    ctx.fillText('Р', robotPos.x * CELL_SIZE + CELL_SIZE * 0.25, robotPos.y * CELL_SIZE + CELL_SIZE * 0.7);
  };

  useEffect(() => {
    drawGrid();
  }, [robotPos, currentLevel]);

  // Инициализация Blockly (только один раз)
  useEffect(() => {
    if (blocklyDivRef.current && !isBlocklyInitialized.current && !workspace) {
      isBlocklyInitialized.current = true;
      const ws = Blockly.inject(blocklyDivRef.current, {
        toolbox: `
          <xml>
            <block type="controls_repeat_ext"></block>
            <block type="robot_move_up"></block>
            <block type="robot_move_down"></block>
            <block type="robot_move_left"></block>
            <block type="robot_move_right"></block>
          </xml>
        `,
      });
      setWorkspace(ws);
    }
    // Очистка при размонтировании
    return () => {
      if (workspace) {
        workspace.dispose();
        setWorkspace(null);
        isBlocklyInitialized.current = false;
      }
    };
  }, []);

  const runCode = async () => {
    if (!workspace) {
      setMessage('Редактор ещё не загружен');
      return;
    }
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    const level = levels[currentLevel];
    setLoading(true);
    try {
      const response = await API.post('/tasks/robot', {
        taskId: `level_${level.id}`,
        solutionCode: code,
      });
      const { success, score, feedback, alreadyCompleted } = response.data;
      setMessage(feedback);
      if (success) {
        if (!alreadyCompleted) {
          const newCompleted = [...completedLevels, level.id];
          setCompletedLevels(newCompleted);
        }
        // Переход к следующему уровню, если есть
        if (currentLevel + 1 < levels.length) {
          const nextIdx = currentLevel + 1;
          setCurrentLevel(nextIdx);
          setRobotPos(levels[nextIdx].start);
          setMessage('');
          if (workspace) workspace.clear();
        } else {
          setMessage('Поздравляем! Вы прошли все уровни!');
        }
      }
    } catch (err) {
      setMessage('Ошибка при проверке задания');
    } finally {
      setLoading(false);
    }
  };

  const resetRobot = () => {
    setRobotPos(levels[currentLevel].start);
    setMessage('');
  };

  const goHome = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', padding: '1rem', gap: '1rem', position: 'relative' }}>
      {/* Постоянная инструкция */}
      <div style={{ 
        position: 'fixed', bottom: '20px', right: '20px', width: showInstructions ? '260px' : 'auto',
        backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 1000, overflow: 'hidden', transition: '0.3s'
      }}>
        <div style={{ backgroundColor: '#f0f0f0', padding: '8px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}
             onClick={() => setShowInstructions(!showInstructions)}>
          <span>📘 Инструкция</span>
          <span>{showInstructions ? '▼' : '▲'}</span>
        </div>
        {showInstructions && (
          <div style={{ padding: '12px', fontSize: '14px' }}>
            <p><strong>Как пользоваться Роботом:</strong></p>
            <ul style={{ margin: '0', paddingLeft: '18px' }}>
              <li>Перетащите блоки из левой панели в рабочую область.</li>
              <li>Соедините блоки последовательно, чтобы задать маршрут.</li>
              <li>Блок «Повторить N раз» позволяет выполнить команды несколько раз.</li>
              <li>Нажмите «Запустить программу».</li>
              <li>Цель – зелёная буква «Ц». Стены – серые клетки.</li>
              <li>За первое прохождение уровня начисляются баллы.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Модальное окно первого входа */}
      {showTutorial && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
            <h2>🤖 Добро пожаловать в модуль «Робот»!</h2>
            <p><strong>Как соединять блоки:</strong></p>
            <ul>
              <li>Каждый блок – команда (вверх, вниз, влево, вправо).</li>
              <li>Перетащите блоки из левой панели на серую рабочую область справа.</li>
              <li>Блоки автоматически прилипают друг к другу – соедините их последовательно.</li>
              <li>Чтобы удалить блок, перетащите его обратно в панель или нажмите правой кнопкой → «Удалить блок».</li>
              <li>Блок «Повторить N раз» позволяет выполнить группу команд несколько раз.</li>
            </ul>
            <button onClick={closeTutorial} style={{ marginTop: '16px', padding: '8px 24px', fontSize: '16px',
                     cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
              Понятно, начать!
            </button>
          </div>
        </div>
      )}

      {/* Основная область */}
      <div>
        <canvas ref={canvasRef} width={GRID_SIZE * CELL_SIZE} height={GRID_SIZE * CELL_SIZE} style={{ border: '1px solid #000' }} />
        <div><strong>Уровень:</strong> {levels[currentLevel].name}</div>
        <button onClick={resetRobot} style={{ marginRight: '0.5rem' }}>Сбросить робота</button>
        <button onClick={runCode} disabled={loading}>{loading ? 'Проверка...' : 'Запустить программу'}</button>
        <button onClick={goHome} style={{ marginLeft: '0.5rem' }}>🏠 На главный экран</button>
        <div style={{ marginTop: '1rem', color: message.includes('Ошибка') ? 'red' : 'green' }}>{message}</div>
      </div>
      <div ref={blocklyDivRef} style={{ width: '500px', height: '500px', border: '1px solid #ccc' }}></div>
    </div>
  );
};

export default RobotGame;