import { useState, useRef, useEffect } from "react";
import Login from "./components/Login";
import Instructions from "./components/Instructions";
import { fileApi } from "./services/api";
import { API_CONFIG } from "./config/api";
import { challenges } from "./data/challenges";
import { getFullDeviceInfo, getIpAddress } from "./utils/clientInfo";

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
  const [drawingName, setDrawingName] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5分钟倒计时
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(5);
  const [lastPoint, setLastPoint] = useState(null);
  const [isInputtingName, setIsInputtingName] = useState(false);
  const [canDraw, setCanDraw] = useState(false); // 改为默认false，只有点击开始绘画后才能绘画
  // 添加新的统计指标状态
  const [firstStrokeTime, setFirstStrokeTime] = useState(null); // 第一笔开始时间
  const [totalStrokeDuration, setTotalStrokeDuration] = useState(0); // 总绘画时间
  const [currentStrokeStartTime, setCurrentStrokeStartTime] = useState(null); // 当前笔画开始时间
  // 添加新的状态变量
  const [firstStrokeDelay, setFirstStrokeDelay] = useState(null); // 首笔延迟（秒）
  const [hasStartedDrawing, setHasStartedDrawing] = useState(false);
  const [showStartButton, setShowStartButton] = useState(false); // 添加控制开始绘画按钮显示的状态
  const [totalUsedTime, setTotalUsedTime] = useState(0); // 添加累计总用时状态
  const [strokesData, setStrokesData] = useState([]); // 记录每一笔的详细信息
  // 添加一个新状态标记是否第一次进入绘画界面
  const [isFirstEntry, setIsFirstEntry] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false); // 添加完成状态
  const [surveyUrl, setSurveyUrl] = useState(
    "https://www.credamo.com/s/YfiU7r/"
  ); // 设置问卷链接
  // 添加确认弹窗相关状态
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState(null);
  // 添加提交加载状态
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (data) => {
    setUser(data.data);
    setShowInstructions(true); // 登录后显示注意事项
  };

  // 处理开始绘画逻辑
  const handleStartDrawing = async () => {
    try {
      // 获取设备信息和IP地址
      const deviceInfo = getFullDeviceInfo();
      const ipAddress = await getIpAddress();
      const loginTime = new Date().toISOString();

      // 创建请求URL和参数
      const url = new URL(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_EXAM}`
      );
      url.searchParams.append("student_id", user.student_id);
      url.searchParams.append("login_time", loginTime);
      url.searchParams.append("ip_address", ipAddress);
      url.searchParams.append("device_info", JSON.stringify(deviceInfo));

      const response = await fetch(url.toString(), {
        method: "GET",
      });

      const data = await response.json();
      if (data.status_code !== 0 || !data.data.exam_id) {
        throw new Error(data.message || "生成题目失败");
      }

      // 更新user对象，添加exam_id
      setUser((prev) => ({ ...prev, exam_id: data.data.exam_id }));

      setShowInstructions(false);
      setShowDrawingBoard(true);
      setShowStartButton(true); // 显示开始绘画按钮
    } catch (err) {
      alert(err.message || "生成题目失败，请稍后重试");
    }
  };

  // 处理开始绘画会话
  const handleStartDrawingSession = () => {
    // 点击开始按钮后，标记不再是第一次
    setIsFirstEntry(false);

    setHasStartedDrawing(true);
    setStartTime(new Date());
    setCanDraw(true);
    setShowStartButton(false); // 点击开始后隐藏开始按钮
    setStrokesData([]); // 初始化笔画数据

    // 初始化历史记录，保存初始空白画布状态
    setHistory([]);
    setHistoryIndex(-1);

    // 使用setTimeout确保在状态更新后和用户开始绘画前保存初始状态
    setTimeout(() => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const newHistory = [];
        newHistory.push({
          imageData: canvas.toDataURL(),
          challenge: currentChallenge,
        });
        setHistory(newHistory);
        setHistoryIndex(0);
      }
    }, 50);
  };

  // 保存画布状态
  const saveState = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      imageData: canvas.toDataURL(),
      challenge: currentChallenge,
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // 撤销
  const undo = () => {
    if (historyIndex > 0) {
      let prevIndex = historyIndex - 1;
      // 找到属于当前题目的上一个状态
      while (
        prevIndex >= 0 &&
        history[prevIndex].challenge !== currentChallenge
      ) {
        prevIndex--;
      }

      if (prevIndex >= 0) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = history[prevIndex].imageData;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setHistoryIndex(prevIndex);
          setUndoCount((prev) => prev + 1);

          // 检查是否回到初始空白状态
          if (prevIndex === 0) {
            setStrokeCount(0); // 如果撤销到初始状态，重置笔画计数
          }
        };
      }
    }
  };

  // 重做
  const redo = () => {
    if (historyIndex < history.length - 1) {
      let nextIndex = historyIndex + 1;
      // 找到属于当前题目的下一个状态
      while (
        nextIndex < history.length &&
        history[nextIndex].challenge !== currentChallenge
      ) {
        nextIndex++;
      }

      if (nextIndex < history.length) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = history[nextIndex].imageData;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setHistoryIndex(nextIndex);
          setRedoCount((prev) => prev + 1);

          // 如果是从初始状态恢复到有内容的状态，需要更新strokeCount
          if (historyIndex === 0 && nextIndex > 0) {
            // 确保strokeCount至少为1，这样完成绘画按钮就会变为可用状态
            setStrokeCount((prev) => (prev === 0 ? 1 : prev));
          }
        };
      }
    }
  };

  // 完成绘画
  const finishDrawing = () => {
    // 当绘画笔数小于5笔时，显示自定义确认弹窗
    if (strokeCount < 5) {
      const handleConfirm = () => {
        setShowConfirmModal(false);
        completeDrawing();
      };

      setConfirmCallback(() => handleConfirm);
      setShowConfirmModal(true);
    } else {
      completeDrawing();
    }
  };

  // 抽取完成绘画的实际逻辑
  const completeDrawing = () => {
    const endTimeNow = new Date();
    setEndTime(endTimeNow);

    // 计算当前绘画任务的用时并累加到总用时
    if (startTime) {
      const currentTaskTime = (endTimeNow - startTime) / 1000; // 转换为秒
      setTotalUsedTime((prev) => prev + currentTaskTime);
    }

    setIsInputtingName(true);
    setCanDraw(false);
  };

  // 提交绘画
  const submitDrawing = async () => {
    // 1. 验证画作名称
    if (!validateDrawingName()) return;

    // 设置提交状态为true，防止重复提交
    setIsSubmitting(true);

    try {
      // 2. 准备绘画数据
      const file = await prepareDrawingFile();
      const formData = createFormData(file);

      // 3. 发送请求并处理响应
      await sendDrawingData(formData);

      // 4. 处理后续流程
      handleSubmissionSuccess();
    } catch (err) {
      // 5. 错误处理
      handleSubmissionError(err);
    } finally {
      // 无论成功还是失败，都重置提交状态
      setIsSubmitting(false);
    }

    // 内部辅助函数
    function validateDrawingName() {
      if (drawingName.length === 0) {
        alert("请输入画作名称！");
        return false;
      }
      if (drawingName.length > 8) {
        alert("画作名称不能超过8个字符！");
        return false;
      }
      return true;
    }

    async function prepareDrawingFile() {
      const canvas = canvasRef.current;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve));
      return new File([blob], `${drawingName}.png`, { type: "image/png" });
    }

    function createFormData(file) {
      // 计算相关统计数据
      const totalDrawingTime = Math.floor(totalUsedTime);
      const firstStrokeDelayValue = firstStrokeDelay || 0;

      // 创建并填充FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("exam_id", user.exam_id);
      formData.append("student_id", user.student_id);
      formData.append("subject_title", currentChallenge + 1);
      formData.append("img_name", drawingName);
      formData.append("used_time", totalDrawingTime);
      formData.append("drawn_strokes", strokeCount);
      formData.append("undo_count", undoCount);
      formData.append("redo_count", redoCount);
      formData.append("first_stroke_time", firstStrokeDelayValue);
      formData.append(
        "total_stroke_duration",
        Math.floor(totalStrokeDuration / 1000)
      );
      formData.append("strokes_data", JSON.stringify(strokesData));

      return formData;
    }

    async function sendDrawingData(formData) {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_SUBJECT}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.status_code !== 0) {
        throw new Error(data.message || "提交失败");
      }

      return data;
    }

    function handleSubmissionSuccess() {
      // 检查是否是最后一个挑战
      if (currentChallenge >= challenges.length - 1) {
        // 最后一个挑战完成，显示结束页面
        setTotalUsedTime(0);
        setIsCompleted(true);
        resetDrawingState();
      } else {
        // 准备下一个挑战
        prepareNextChallenge();
      }
    }

    function resetDrawingState() {
      setIsInputtingName(false);
      setDrawingName("");
      setShowCountdown(false);
      setCanDraw(false);
      setHasStartedDrawing(false);
      setFirstStrokeTime(null);
      setTotalStrokeDuration(0);
      setFirstStrokeDelay(null);
      setStartTime(null);
      setEndTime(null);
    }

    function prepareNextChallenge() {
      setIsInputtingName(false);
      setDrawingName("");
      setShowCountdown(true);
      setCountdownValue(5);
      setCanDraw(false);
      setHasStartedDrawing(false);
      // 只重置部分状态，保留总用时
      setFirstStrokeTime(null);
      setTotalStrokeDuration(0);
      setFirstStrokeDelay(null);
      setStartTime(null);
      setEndTime(null);
      // 立即更新到下一个挑战的编号，而不是等倒计时结束
      setCurrentChallenge((prev) => prev + 1);
      // 重置时间为5分钟
      setTimeLeft(300);
    }

    function handleSubmissionError(err) {
      const errorMessage = err.message || "提交失败，请稍后重试";
      console.error("提交绘画失败:", errorMessage);
      alert(errorMessage);
    }
  };

  useEffect(() => {
    if (showDrawingBoard && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d", { alpha: false }); // 禁用alpha通道

      // 响应式画布尺寸，适配不同屏幕大小
      const setCanvasSize = () => {
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        // 确保画布尺寸不超过屏幕宽度
        const size = Math.min(500, containerWidth - 20);
        canvas.width = size;
        canvas.height = size;

        // 重新填充白色背景
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);

        // 设置画笔属性
        context.globalAlpha = 1.0; // 设置完全不透明
        context.globalCompositeOperation = "source-over";
        context.strokeStyle = "black";
        context.fillStyle = "black";
        context.lineWidth = 3;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.imageSmoothingEnabled = false; // 禁用抗锯齿

        // 只有在已经开始绘画的状态下才绘制背景提示
        // 放到这里确保每次画布尺寸变化时都会重新绘制背景
        if (hasStartedDrawing && challenges[currentChallenge].drawBackground) {
          // 保存当前上下文状态
          context.save();

          // 设置缩放比例以适应当前画布尺寸
          const scale = size / 500; // 计算缩放比例
          context.scale(scale, scale);

          // 应用绘制背景函数
          challenges[currentChallenge].drawBackground(context);

          // 恢复上下文状态
          context.restore();
        }
      };

      setCanvasSize();
      contextRef.current = context;

      // 添加窗口大小变化监听，响应式调整画布
      window.addEventListener("resize", setCanvasSize);

      return () => {
        window.removeEventListener("resize", setCanvasSize);
      };
    }
  }, [showDrawingBoard, currentChallenge, hasStartedDrawing]);

  // 倒计时效果
  useEffect(() => {
    if (showCountdown && countdownValue > 0) {
      const timer = setInterval(() => {
        setCountdownValue((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (showCountdown && countdownValue === 0) {
      setShowCountdown(false);
      // 重置绘画状态
      setHistory([]);
      setHistoryIndex(-1);
      setStrokeCount(0);
      setUndoCount(0);
      setRedoCount(0);
      setCanDraw(false); // 初始不允许绘画
      setHasStartedDrawing(false); // 重置开始绘画状态

      // 重置统计指标
      setFirstStrokeTime(null);
      setTotalStrokeDuration(0);
      setCurrentStrokeStartTime(null);
      setStartTime(null);
      setEndTime(null);

      // 如果已经完成所有挑战，重置总用时
      if (currentChallenge >= challenges.length) {
        setTotalUsedTime(0);
        setIsCompleted(true); // 标记为已完成所有任务
      }

      // 重新初始化画布
      const canvas = canvasRef.current;
      const context = contextRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = 1.0;
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = "black";
      context.fillStyle = "black";
      context.lineWidth = 3;
      saveState();

      // 关键修改：检查是否是第一次绘画
      if (isFirstEntry) {
        // 如果是第一次，显示开始按钮
        setShowStartButton(true);
      } else {
        // 不是第一次，自动开始绘画
        handleStartDrawingSession();
      }
    }
  }, [showCountdown, countdownValue]);

  // 修改时间限制的useEffect
  useEffect(() => {
    if (
      showDrawingBoard &&
      hasStartedDrawing &&
      timeLeft > 0 &&
      !isInputtingName
    ) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      finishDrawing();
    }
  }, [timeLeft, showDrawingBoard, hasStartedDrawing, isInputtingName]);

  useEffect(() => {
    // 添加防止页面滚动和缩放的处理
    const preventDefault = (e) => {
      e.preventDefault();
    };

    document.addEventListener("touchmove", preventDefault, { passive: false });
    document.addEventListener("gesturestart", preventDefault);
    document.addEventListener("gesturechange", preventDefault);
    document.addEventListener("gestureend", preventDefault);

    return () => {
      document.removeEventListener("touchmove", preventDefault);
      document.removeEventListener("gesturestart", preventDefault);
      document.removeEventListener("gesturechange", preventDefault);
      document.removeEventListener("gestureend", preventDefault);
    };
  }, []);

  // 将 handleStrokeEnd 函数移到这里，组件内部
  const handleStrokeEnd = () => {
    if (isDrawing && hasStartedDrawing) {
      setIsDrawing(false);
      setLastPoint(null);

      const now = new Date();

      // 更新当前笔画的结束时间和持续时间
      setStrokesData((prev) => {
        const updatedStrokes = [...prev];
        if (updatedStrokes.length > 0) {
          const currentStroke = updatedStrokes[updatedStrokes.length - 1];
          currentStroke.endTime = now;
          currentStroke.duration = now - currentStroke.startTime;
        }
        return updatedStrokes;
      });

      // 计算并累加笔画持续时间
      if (currentStrokeStartTime) {
        const strokeDuration = now - currentStrokeStartTime;
        setTotalStrokeDuration((prev) => prev + strokeDuration);
        setCurrentStrokeStartTime(null);
      }

      saveState();
    }
  };

  // 处理关闭页面的函数
  const handleClosePage = () => {
    window.close(); // 尝试关闭窗口
    // 如果window.close()不起作用（这在某些浏览器中会被阻止），提示用户
    setTimeout(() => {
      alert("请手动关闭此页面。感谢您的参与！");
    }, 300);
  };

  // 如果存在问卷链接，跳转到问卷
  const handleSurvey = () => {
    if (surveyUrl) {
      window.location.href = surveyUrl;
    } else {
      alert("问卷链接暂未设置，请稍后再试。");
    }
  };

  // 确认弹窗组件
  const ConfirmModal = () => {
    if (!showConfirmModal) return null;

    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 select-none touch-none"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      >
        <div className="bg-white rounded-lg p-6 w-80 shadow-xl transform transition-all duration-300 scale-100">
          <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">
            确认提交
          </h3>
          <p className="mb-6 text-gray-600 text-center">
            您只画了不到5笔，确定要完成绘画吗？
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={confirmCallback}
              className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 命名弹窗组件
  const NameInputModal = () => {
    if (!isInputtingName) return null;

    // 添加一个状态标记是否正在输入中文
    const [isComposing, setIsComposing] = useState(false);
    const [localName, setLocalName] = useState(drawingName);

    // 当输入法结束时，更新drawingName状态
    const handleCompositionEnd = (e) => {
      setIsComposing(false);
      setDrawingName(e.target.value);
    };

    // 当输入法开始时，标记正在输入中文
    const handleCompositionStart = () => {
      setIsComposing(true);
    };

    // 处理输入变化
    const handleChange = (e) => {
      setLocalName(e.target.value);
      // 只有在不是中文输入过程中才更新drawingName
      if (!isComposing) {
        setDrawingName(e.target.value);
      }
    };

    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 select-none touch-none"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      >
        <div className="bg-white rounded-lg p-6 w-96 shadow-xl transform transition-all duration-300 scale-100">
          <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">
            为你的画作命名
          </h3>
          <p className="mb-4 text-gray-600 text-center">
            请用尽可能简洁的中文词汇告诉我你画的是什么
          </p>
          <div className="mb-5">
            <input
              type="text"
              value={localName}
              onChange={handleChange}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder="你画的是...（不超过8个字符）"
              maxLength={8}
              className="p-2.5 w-full text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              autoComplete="off"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-center">
            <button
              onClick={submitDrawing}
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-white rounded-md transition-colors duration-200 cursor-pointer ${
                isSubmitting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  提交中...
                </span>
              ) : currentChallenge >= challenges.length - 1 ? (
                "提交，进入下一环节"
              ) : (
                "提交，进入下一幅"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 添加一个固定在右上角的用户信息组件
  const UserInfoBar = ({ username, studentId }) => (
    <div className="fixed top-0 right-0 z-50 p-2 m-2 flex items-center bg-white rounded-lg shadow-sm border border-gray-100 py-2 px-3 text-sm">
      <svg
        className="h-5 w-5 text-blue-600 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      <div>
        <span className="font-medium text-gray-700">{username}</span>
        <span className="mx-1 text-gray-400">|</span>
        <span className="text-gray-500">学号: </span>
        <span className="font-mono text-blue-600">{studentId}</span>
      </div>
    </div>
  );

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (showInstructions) {
    return (
      <>
        <UserInfoBar username={user.username} studentId={user.student_id} />
        <div className="flex flex-col items-center px-2 sm:px-5 select-none touch-none max-w-full pt-14">
          <Instructions onStart={handleStartDrawing} />
        </div>
      </>
    );
  }

  // 添加完成页面
  if (isCompleted) {
    return (
      <>
        <UserInfoBar username={user.username} studentId={user.student_id} />
        <div className="flex flex-col items-center px-2 sm:px-5 select-none touch-none max-w-full pt-14">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8 mb-5 sm:mb-10 w-full max-w-xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-6 sm:mb-8">
              恭喜你完成了所有绘画挑战！
            </h2>
            <p className="text-lg sm:text-xl mb-8 sm:mb-10 text-gray-700">
              感谢你的参与和创作，你的每一幅作品都很有价值。
            </p>

            <button
              onClick={handleSurvey}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-md cursor-pointer transition-colors duration-200"
            >
              前往填写问卷
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <UserInfoBar username={user.username} studentId={user.student_id} />
      <div className="flex flex-col items-center px-2 sm:px-5 select-none touch-none max-w-full pt-14">
        {/* 整合标题、画板、操作按钮和倒计时的卡片 */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 sm:p-5 mb-3 sm:mb-5 w-full max-w-xl">
          {/* 标题部分 */}
          {isInputtingName ? (
            <div className="text-center mb-3 sm:mb-5">
              <svg
                className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                请为你的画作命名
              </h2>
            </div>
          ) : (
            <div className="mb-3 sm:mb-5">
              <div className="flex flex-wrap justify-between items-center mb-2 sm:mb-3">
                <div className="flex items-center mb-2 sm:mb-0">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-1 sm:mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    绘画挑战
                  </h2>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* 剩余时间显示 */}
                  {!isInputtingName && (
                    <div className="flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 rounded-lg">
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-1 sm:mr-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="flex items-center text-blue-700 font-mono font-bold text-sm sm:text-base">
                        <span>{Math.floor(timeLeft / 60)}</span>
                        <span
                          className={`mx-0.5 ${
                            timeLeft % 2 === 0 ? "opacity-50" : "opacity-100"
                          } transition-opacity duration-500`}
                        >
                          :
                        </span>
                        <span>
                          {(timeLeft % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  )}
                  <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                    {currentChallenge + 1}/{challenges.length}
                  </span>
                </div>
              </div>
              <div className="border-b border-gray-100 mb-2 sm:mb-3"></div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-1 sm:mb-2">
                {challenges[currentChallenge].title}
              </h3>
              <p
                className={`text-sm sm:text-base ${
                  showStartButton
                    ? "text-blue-600 font-semibold"
                    : "text-red-500"
                }`}
              >
                {showStartButton
                  ? "准备好了就请点击【开始绘画】吧"
                  : challenges[currentChallenge].tips}
              </p>
            </div>
          )}

          {/* 画板部分 */}
          <div className="relative w-full">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 mb-3 touch-none select-none bg-white mx-auto"
              onPointerDown={(e) => {
                if (!canDraw || !hasStartedDrawing) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const point = {
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  pressure: e.pressure || 1,
                };
                setLastPoint(point);
                setIsDrawing(true);
                setStrokeCount((prev) => prev + 1);

                const now = new Date();

                // 记录首次落笔时间和延迟
                if (!firstStrokeTime) {
                  setFirstStrokeTime(now);
                  // 直接计算并存储延迟（秒）
                  setFirstStrokeDelay(Math.floor((now - startTime) / 1000));
                }

                // 记录当前笔画的开始时间
                setCurrentStrokeStartTime(now);

                // 计算与上一笔的间隔时间
                const lastStrokeEndTime =
                  strokesData.length > 0
                    ? strokesData[strokesData.length - 1].endTime
                    : startTime;
                const interval = now - lastStrokeEndTime;

                // 添加新的笔画记录
                setStrokesData((prev) => [
                  ...prev,
                  {
                    index: strokeCount + 1,
                    startTime: now,
                    endTime: null,
                    duration: null,
                    interval: interval,
                  },
                ]);

                e.currentTarget.setPointerCapture(e.pointerId);

                const ctx = contextRef.current;
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
              }}
              onPointerMove={(e) => {
                if (!canDraw || !isDrawing || !lastPoint || !hasStartedDrawing)
                  return;
                const rect = e.currentTarget.getBoundingClientRect();
                const point = {
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  pressure: e.pressure || 1,
                };

                const ctx = contextRef.current;
                const pressure = point.pressure;
                ctx.globalAlpha = 1.0;
                ctx.globalCompositeOperation = "source-over";
                ctx.lineWidth = 3;
                ctx.strokeStyle = "black";
                ctx.fillStyle = "black";
                ctx.imageSmoothingEnabled = false;

                ctx.lineTo(point.x, point.y);
                ctx.stroke();
                setLastPoint(point);
              }}
              onPointerUp={(e) => {
                handleStrokeEnd();
                e.currentTarget.releasePointerCapture(e.pointerId);
              }}
              onPointerOut={(e) => {
                handleStrokeEnd();
                e.currentTarget.releasePointerCapture(e.pointerId);
              }}
              style={{
                cursor:
                  canDraw && hasStartedDrawing ? "crosshair" : "not-allowed",
                touchAction: "none", // 防止触摸操作引起页面滚动
                // 添加CSS变量确保光标始终可见
                "--cursor-visibility": "visible !important",
                pointerEvents: "auto",
              }}
            />

            {!hasStartedDrawing && showStartButton && (
              <button
                onClick={handleStartDrawingSession}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full cursor-pointer select-none touch-manipulation"
              >
                开始绘画
              </button>
            )}
          </div>

          {/* 操作按钮组 */}
          {!isInputtingName && (
            <div className="flex justify-center gap-2 sm:gap-3">
              <button
                onClick={undo}
                disabled={
                  !canDraw ||
                  !history
                    .slice(0, historyIndex)
                    .some((h) => h.challenge === currentChallenge)
                }
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white border-none rounded-lg cursor-pointer disabled:bg-gray-300 select-none touch-manipulation text-sm sm:text-base"
              >
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 sm:h-4 sm:w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  撤销
                </span>
              </button>
              <button
                onClick={redo}
                disabled={
                  !canDraw ||
                  !history
                    .slice(historyIndex + 1)
                    .some((h) => h.challenge === currentChallenge)
                }
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white border-none rounded-lg cursor-pointer disabled:bg-gray-300 select-none touch-manipulation text-sm sm:text-base"
              >
                <span className="flex items-center">
                  恢复
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 sm:h-4 sm:w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              </button>
              <button
                onClick={finishDrawing}
                disabled={!canDraw || strokeCount === 0 || historyIndex === 0}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white border-none rounded-lg cursor-pointer disabled:bg-gray-300 select-none touch-manipulation text-sm sm:text-base"
              >
                完成绘画
              </button>
            </div>
          )}
        </div>

        {/* 倒计时弹窗 */}
        {showCountdown && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 select-none touch-none"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          >
            <div className="bg-white rounded-lg p-8 shadow-xl transform transition-all duration-300 scale-100 flex flex-col items-center">
              <h3 className="text-xl font-bold mb-2 text-gray-800 text-center">
                准备开始
              </h3>
              <p className="mb-6 text-gray-600 text-center">
                下一个绘画任务将在倒计时结束后开始
              </p>
              <div className="w-24 h-24 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                <span className="text-5xl font-bold text-blue-500">
                  {countdownValue}
                </span>
              </div>
              <p className="text-sm text-gray-500">请稍候...</p>
            </div>
          </div>
        )}

        {/* 确认弹窗 */}
        <ConfirmModal />

        {/* 命名弹窗 */}
        <NameInputModal />
      </div>
    </>
  );
}

export default App;
