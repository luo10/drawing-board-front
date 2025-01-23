import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Login from './components/Login';
import Instructions from './components/Instructions';
import { fileApi } from './services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Canvas = styled.canvas`
  border: 1px solid #ccc;
  margin-bottom: 20px;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
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
`;

const Stats = styled.div`
  margin-bottom: 20px;
  text-align: left;
  width: 100%;
  max-width: 600px;
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
`;

const Challenge = styled.div`
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
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
  const [userInfo, setUserInfo] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showDrawingBoard, setShowDrawingBoard] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [strokeCount, setStrokeCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const [drawingName, setDrawingName] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(5);
  const [lastPoint, setLastPoint] = useState(null);
  const [isInputtingName, setIsInputtingName] = useState(false);
  const [canDraw, setCanDraw] = useState(true);

  const handleLogin = (info) => {
    setUserInfo(info);
    setShowInstructions(true);
  };

  const handleStartExperiment = () => {
    setShowInstructions(false);
    setShowDrawingBoard(true);
  };

  useEffect(() => {
    if (!showDrawingBoard || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 设置默认画笔属性
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;  
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    loadBackgroundImage();
    saveState();

    return () => {
    };
  }, [currentChallenge, showDrawingBoard]);

  const loadBackgroundImage = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    challenges[currentChallenge].drawBackground(ctx);
    saveState();
  };

  useEffect(() => {
    if (!showDrawingBoard) return;
    
    if (timeLeft > 0 && startTime) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, startTime, showDrawingBoard]);

  useEffect(() => {
    if (showCountdown && countdownValue > 0) {
      const timer = setInterval(() => {
        setCountdownValue(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (showCountdown && countdownValue === 0) {
      setShowCountdown(false);
      nextChallenge();
    }
  }, [showCountdown, countdownValue]);

  const saveState = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const getPointFromEvent = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
      y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top,
      pressure: e.pressure !== undefined ? e.pressure : 1
    };
    return point;
  };

  const startDrawing = (point) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 设置绘画属性
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;  
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    setIsDrawing(true);

    if (!startTime) {
      setStartTime(new Date());
    }
    setStrokeCount(prev => prev + 1);
  };

  const draw = (point) => {
    if (!isDrawing || !lastPoint || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 设置线条属性
    ctx.strokeStyle = '#000000';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 根据压力值调整线条宽度，增加基础宽度
    const baseWidth = 4;  
    const pressure = point.pressure || 1;
    ctx.lineWidth = baseWidth * (pressure * 1.5);
    
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    setLastPoint(point);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = history[historyIndex - 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistoryIndex(prev => prev - 1);
        setUndoCount(prev => prev + 1);
      };
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = history[historyIndex + 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistoryIndex(prev => prev + 1);
        setRedoCount(prev => prev + 1);
      };
    }
  };

  const finishDrawing = () => {
    setEndTime(new Date());
    setIsFinished(true);
    setIsInputtingName(true);
    setCanDraw(false);
  };

  const submitDrawing = async () => {
    if (drawingName.length === 0) {
      alert('请输入画作名称！');
      return;
    }
    if (drawingName.length > 8) {
      alert('画作名称不能超过8个字符！');
      return;
    }

    try {
      // Convert canvas to blob
      const canvas = canvasRef.current;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      // Create a File object with metadata
      const file = new File([blob], `${drawingName}.png`, {
        type: 'image/png',
        lastModified: new Date(),
      });

      // Upload the file
      const response = await fileApi.uploadFile(file);
      
      // Reset for next challenge
      setIsInputtingName(false);
      setDrawingName('');
      setShowCountdown(true);
      setCountdownValue(5);
      setCanDraw(true);
      
      // Clear canvas state
      setHistory([]);
      setHistoryIndex(-1);
      setStrokeCount(0);
      setUndoCount(0);
      setRedoCount(0);
      setStartTime(null);
      setEndTime(null);
      setIsFinished(false);
      
    } catch (error) {
      console.error('Error uploading drawing:', error);
      alert('保存失败，请重试');
    }
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
      resetDrawingState();
    } else {
      alert('恭喜你完成了所有绘画挑战！');
    }
  };

  const resetDrawingState = () => {
    setIsDrawing(false);
    setStartTime(null);
    setEndTime(null);
    setStrokeCount(0);
    setHistory([]);
    setHistoryIndex(-1);
    setUndoCount(0);
    setRedoCount(0);
    setDrawingName('');
    setIsFinished(false);
    setTimeLeft(600);
    setShowCountdown(false);
    setCountdownValue(5);
    setIsInputtingName(false);
    setCanDraw(true);
  };

  if (!userInfo) {
    return <Login onLogin={handleLogin} />;
  }

  if (showInstructions) {
    return <Instructions onStart={handleStartExperiment} />;
  }

  return (
    <Container>
      <h2>创意画板</h2>
      {userInfo && (
        <div style={{ marginBottom: '1rem' }}>
          <span>姓名：{userInfo.name}</span>
          <span style={{ marginLeft: '2rem' }}>学号：{userInfo.studentId}</span>
        </div>
      )}
      <Challenge>{challenges[currentChallenge].title}</Challenge>
      <div>剩余时间: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
      <Canvas
        ref={canvasRef}
        width={600}
        height={400}
        onPointerDown={(e) => {
          if (!canDraw) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            pressure: e.pressure || 1
          };
          e.currentTarget.setPointerCapture(e.pointerId);
          setLastPoint(point);
          startDrawing(point);
        }}
        onPointerMove={(e) => {
          if (!canDraw || !isDrawing || !lastPoint) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            pressure: e.pressure || 1
          };
          draw(point);
        }}
        onPointerUp={(e) => {
          stopDrawing();
          setLastPoint(null);
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerOut={(e) => {
          stopDrawing();
          setLastPoint(null);
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        style={{ cursor: canDraw ? 'crosshair' : 'not-allowed' }}
      />
      <ButtonGroup>
        <Button onClick={undo} disabled={!canDraw || historyIndex <= 0}>撤销</Button>
        <Button onClick={redo} disabled={!canDraw || historyIndex >= history.length - 1}>重做</Button>
        <Button onClick={finishDrawing} disabled={isFinished}>完成绘画</Button>
      </ButtonGroup>
      
      {isInputtingName && (
        <div style={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <h3>为你的画作命名</h3>
          <NameInput
            type="text"
            maxLength={8}
            placeholder="请为画作命名（最多8字）"
            value={drawingName}
            onChange={(e) => setDrawingName(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          <Button onClick={submitDrawing} style={{ marginTop: '10px' }}>提交并进入下一幅</Button>
        </div>
      )}

      {showCountdown && (
        <Countdown>{countdownValue}</Countdown>
      )}

      <Stats>
        <p>当前题目: {currentChallenge + 1}/6</p>
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
