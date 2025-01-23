import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Login from './components/Login';
import Instructions from './components/Instructions';
import { fileApi } from './services/api';
import { API_CONFIG } from './config/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  user-select: none; 
  touch-action: none; 
  -webkit-touch-callout: none; 
  -webkit-user-select: none; 
`;

const Canvas = styled.canvas`
  border: 1px solid #ccc;
  margin-bottom: 20px;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  background-color: white; // 确保背景为纯白
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  user-select: none;
  -webkit-user-select: none;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background-color: #ccc;
  }
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation; 
`;

const Stats = styled.div`
  margin-bottom: 20px;
  text-align: left;
  width: 100%;
  max-width: 600px;
  user-select: none;
  -webkit-user-select: none;
`;

const UserInfo = styled.div`
  margin-bottom: 20px;
  text-align: right;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  user-select: none;
  -webkit-user-select: none;
`;

const NameInput = styled.input`
  padding: 8px;
  margin-right: 10px;
  width: 200px;
`;

const Countdown = styled.div`
  font-size: 48px;
  font-weight: bold;
  color: #007bff;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 10px;
  z-index: 1000;
  user-select: none;
  -webkit-user-select: none;
`;

const Challenge = styled.div`
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  user-select: none;
  -webkit-user-select: none;
`;

const challenges = [
  { title: "画一只可爱的小猫", drawBackground: (ctx) => {
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.ellipse(300, 200, 100, 70, 0, 0, 2 * Math.PI);
    ctx.stroke();
    // 画两个三角形耳朵
    ctx.beginPath();
    ctx.moveTo(220, 140);
    ctx.lineTo(250, 100);
    ctx.lineTo(280, 140);
    ctx.moveTo(320, 140);
    ctx.lineTo(350, 100);
    ctx.lineTo(380, 140);
    ctx.stroke();
  }},
  { title: "画一朵美丽的花", drawBackground: (ctx) => {
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.arc(300, 200, 50, 0, 2 * Math.PI);
    ctx.moveTo(300, 250);
    ctx.lineTo(300, 350);
    ctx.stroke();
  }},
  { title: "画一座山", drawBackground: (ctx) => {
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(100, 350);
    ctx.lineTo(300, 100);
    ctx.lineTo(500, 350);
    ctx.stroke();
  }},
  { title: "画一条小船", drawBackground: (ctx) => {
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(200, 250);
    ctx.lineTo(400, 250);
    ctx.lineTo(450, 300);
    ctx.lineTo(150, 300);
    ctx.closePath();
    ctx.stroke();
  }},
  { title: "画一棵大树", drawBackground: (ctx) => {
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(300, 350);
    ctx.lineTo(300, 150);
    ctx.moveTo(300, 150);
    ctx.arc(300, 150, 80, 0, Math.PI, true);
    ctx.stroke();
  }},
  { title: "画一个房子", drawBackground: (ctx) => {
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(200, 250);
    ctx.lineTo(400, 250);
    ctx.lineTo(400, 350);
    ctx.lineTo(200, 350);
    ctx.closePath();
    ctx.moveTo(200, 250);
    ctx.lineTo(300, 150);
    ctx.lineTo(400, 250);
    ctx.stroke();
  }}
];

function App() {
  const [user, setUser] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showDrawingBoard, setShowDrawingBoard] = useState(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [strokeCount, setStrokeCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [drawingName, setDrawingName] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10分钟
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(5);
  const [lastPoint, setLastPoint] = useState(null);
  const [isInputtingName, setIsInputtingName] = useState(false);
  const [canDraw, setCanDraw] = useState(true);

  const handleLogin = (data) => {
    setUser(data.data);
    setShowInstructions(true); // 登录后显示注意事项
  };

  const handleStartDrawing = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_EXAM}?student_id=${user.student_id}`, {
        method: 'GET',
      });

      const data = await response.json();
      if (data.status_code !== 0 || !data.data.exam_id) {
        throw new Error(data.message || '生成题目失败');
      }

      setShowInstructions(false);
      setShowDrawingBoard(true);
      setStartTime(new Date());
    } catch (err) {
      alert(err.message || '生成题目失败，请稍后重试');
    }
  };

  // 保存画布状态
  const saveState = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      imageData: canvas.toDataURL(),
      challenge: currentChallenge
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // 撤销
  const undo = () => {
    if (historyIndex > 0) {
      let prevIndex = historyIndex - 1;
      // 找到属于当前题目的上一个状态
      while (prevIndex >= 0 && history[prevIndex].challenge !== currentChallenge) {
        prevIndex--;
      }
      
      if (prevIndex >= 0) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = history[prevIndex].imageData;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setHistoryIndex(prevIndex);
          setUndoCount(prev => prev + 1);
        };
      }
    }
  };

  // 重做
  const redo = () => {
    if (historyIndex < history.length - 1) {
      let nextIndex = historyIndex + 1;
      // 找到属于当前题目的下一个状态
      while (nextIndex < history.length && history[nextIndex].challenge !== currentChallenge) {
        nextIndex++;
      }
      
      if (nextIndex < history.length) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = history[nextIndex].imageData;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setHistoryIndex(nextIndex);
          setRedoCount(prev => prev + 1);
        };
      }
    }
  };

  // 完成绘画
  const finishDrawing = () => {
    setEndTime(new Date());
    setIsInputtingName(true);
    setCanDraw(false);
  };

  // 提交绘画
  const submitDrawing = () => {
    if (drawingName.length === 0) {
      alert('请输入画作名称！');
      return;
    }
    if (drawingName.length > 8) {
      alert('画作名称不能超过8个字符！');
      return;
    }
    
    // 重置状态
    setIsInputtingName(false);
    setDrawingName('');
    setShowCountdown(true);
    setCountdownValue(5);
    setCanDraw(false); // 倒计时时禁止绘画
  };

  useEffect(() => {
    if (showDrawingBoard && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { alpha: false }); // 禁用alpha通道
      
      canvas.width = 600;
      canvas.height = 400;

      // 先填充白色背景
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // 设置画笔属性
      context.globalAlpha = 1.0; // 设置完全不透明
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = 'black';
      context.fillStyle = 'black';
      context.lineWidth = 3;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.imageSmoothingEnabled = false; // 禁用抗锯齿
      contextRef.current = context;

      // 绘制背景
      if (challenges[currentChallenge].drawBackground) {
        challenges[currentChallenge].drawBackground(context);
      }
      
      // 保存初始状态
      saveState();
    }
  }, [showDrawingBoard, currentChallenge]);

  // 倒计时效果
  useEffect(() => {
    if (showCountdown && countdownValue > 0) {
      const timer = setInterval(() => {
        setCountdownValue(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (showCountdown && countdownValue === 0) {
      setShowCountdown(false);
      // 倒计时结束后再进入下一题
      // 清空画布状态
      setHistory([]);
      setHistoryIndex(-1);
      setStrokeCount(0);
      setUndoCount(0);
      setRedoCount(0);
      setStartTime(new Date());
      setEndTime(null);
      setTimeLeft(600); // 重置时间为10分钟
      setCanDraw(true); // 允许绘画
      
      // 进入下一个挑战
      if (currentChallenge < challenges.length - 1) {
        setCurrentChallenge(prev => prev + 1);
        // 重新初始化画布
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1.0; // 设置完全不透明
        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = 'black';
        context.fillStyle = 'black';
        context.lineWidth = 3;
        if (challenges[currentChallenge + 1].drawBackground) {
          challenges[currentChallenge + 1].drawBackground(context);
        }
        saveState();
      } else {
        alert('恭喜你完成了所有绘画挑战！');
      }
    }
  }, [showCountdown, countdownValue]);

  // 时间限制
  useEffect(() => {
    if (showDrawingBoard && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      finishDrawing();
    }
  }, [timeLeft, showDrawingBoard]);

  useEffect(() => {
    // 添加防止页面滚动和缩放的处理
    const preventDefault = (e) => {
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('gesturestart', preventDefault);
    document.addEventListener('gesturechange', preventDefault);
    document.addEventListener('gestureend', preventDefault);

    return () => {
      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('gesturestart', preventDefault);
      document.removeEventListener('gesturechange', preventDefault);
      document.removeEventListener('gestureend', preventDefault);
    };
  }, []);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (showInstructions) {
    return (
      <Container>
        <UserInfo>
          欢迎你，{user.username} (学号: {user.student_id})
        </UserInfo>
        <Instructions onStart={handleStartDrawing} />
      </Container>
    );
  }

  return (
    <Container>
      <UserInfo>
        欢迎你，{user.username} (学号: {user.student_id})
      </UserInfo>
      <Challenge>{challenges[currentChallenge].title}</Challenge>
      <div>剩余时间: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
      <Canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          if (!canDraw) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            pressure: e.pressure || 1
          };
          setLastPoint(point);
          setIsDrawing(true);
          setStrokeCount(prev => prev + 1);
          e.currentTarget.setPointerCapture(e.pointerId);
          
          const ctx = contextRef.current;
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
        }}
        onPointerMove={(e) => {
          if (!canDraw || !isDrawing || !lastPoint) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            pressure: e.pressure || 1
          };
          
          const ctx = contextRef.current;
          const pressure = point.pressure;
          ctx.globalAlpha = 1.0;
          ctx.globalCompositeOperation = 'source-over';
          ctx.lineWidth = 3 * (pressure * 1.5); // 基于3的线宽进行压感调整
          ctx.strokeStyle = 'black';
          ctx.fillStyle = 'black';
          ctx.imageSmoothingEnabled = false;
          
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
          setLastPoint(point);
        }}
        onPointerUp={(e) => {
          if (isDrawing) {
            setIsDrawing(false);
            setLastPoint(null);
            saveState();
          }
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerOut={(e) => {
          if (isDrawing) {
            setIsDrawing(false);
            setLastPoint(null);
            saveState();
          }
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        style={{ cursor: canDraw ? 'crosshair' : 'not-allowed' }}
      />
      
      <ButtonGroup>
        <Button onClick={undo} disabled={!canDraw || !history.slice(0, historyIndex).some(h => h.challenge === currentChallenge)}>撤销</Button>
        <Button onClick={redo} disabled={!canDraw || !history.slice(historyIndex + 1).some(h => h.challenge === currentChallenge)}>重做</Button>
        <Button onClick={finishDrawing} disabled={!canDraw}>完成绘画</Button>
      </ButtonGroup>
      
      {isInputtingName && (
        <div style={{
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <input
            type="text"
            value={drawingName}
            onChange={(e) => setDrawingName(e.target.value)}
            placeholder="请输入画作名称（不超过8个字符）"
            maxLength={8}
            style={{
              padding: '8px',
              fontSize: '16px',
              width: '300px'
            }}
            autoFocus
            autoComplete="off"
          />
          <Button onClick={submitDrawing}>提交并进入下一幅</Button>
        </div>
      )}

      {showCountdown && (
        <Countdown>{countdownValue}</Countdown>
      )}

      <Stats>
        <p>当前题目: {currentChallenge + 1}/{challenges.length}</p>
        <p>开始时间: {startTime?.toLocaleTimeString()}</p>
        <p>笔画数: {strokeCount}</p>
        <p>撤销次数: {undoCount}</p>
        <p>重做次数: {redoCount}</p>
        {endTime && <p>结束时间: {endTime.toLocaleTimeString()}</p>}
        {endTime && <p>总用时: {((endTime - startTime) / 1000).toFixed(1)}秒</p>}
      </Stats>
    </Container>
  );
}

export default App;
