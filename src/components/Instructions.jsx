import { useState, useEffect } from "react";

function Instructions({ onStart }) {
  const [countdown, setCountdown] = useState(10);
  const [canStart, setCanStart] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanStart(true);
    }
  }, [countdown]);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h1 className="text-center text-2xl font-bold text-gray-800 mb-8">
          实验须知
        </h1>
        <ul className="mb-8 space-y-4 text-base leading-relaxed">
          <li>本实验共包含6道绘画题目，每道题目限时5分钟。</li>
          <li>
            每道题目都会提供一个基础轮廓图，请在此基础上使用鼠标进行绘画创作。
          </li>
          <li>绘画过程中可以使用撤销（撤销上一笔）和恢复（恢复撤销）功能。</li>
          <li>
            每完成一幅画作后，请用尽可能简洁的中文词汇告诉我你画的是什么，然后提交。
          </li>
          <li>
            提交后会有5秒倒计时，期间不能继续绘画，倒计时结束后自动进入下一题。
          </li>
          <li>
            请认真对待每一幅作品，
            <span className="text-red-500 font-bold">
              尽量让每一幅作品画出的东西不一样，充分发挥你的创造力
            </span>
            。
          </li>
          <li>
            <span className="font-bold">
              实验过程中请勿刷新页面或退出，否则数据会丢失
            </span>
            。
          </li>
        </ul>

        <button
          onClick={onStart}
          disabled={!canStart}
          className={`px-8 py-3 rounded-md text-white text-base mx-auto block transition-colors
            ${
              canStart
                ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          {countdown > 0
            ? `请等待 ${countdown} 秒后开始实验`
            : "我已了解，开始实验"}
        </button>
      </div>
    </div>
  );
}

export default Instructions;
