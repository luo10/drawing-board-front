import { useState, useEffect } from "react";

function Instructions({ onStart }) {
  const [countdown, setCountdown] = useState(1);
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
    <div className="flex flex-col items-center justify-center  sm:p-8">
      <div className="bg-white p-5 sm:p-10 rounded-2xl shadow-xl w-full max-w-4xl border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-5 sm:mb-10">
          实验须知
        </h1>

        <ul className="mb-6 sm:mb-10 space-y-4 sm:space-y-6 text-sm sm:text-base leading-relaxed text-gray-700">
          <li className="flex items-start">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>本实验共包含6道绘画题目，每道题目限时5分钟。</span>
          </li>

          <li className="flex items-start">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              每道题目都会提供一个基础轮廓图，请在此基础上使用鼠标进行绘画创作。
            </span>
          </li>

          <li className="flex items-start">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              绘画过程中可以使用撤销（撤销上一笔）和恢复（恢复撤销）功能。
            </span>
          </li>

          <li className="flex items-start">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              每完成一幅画作后，请用尽可能简洁的中文词汇告诉我你画的是什么，然后提交。
            </span>
          </li>

          <li className="flex items-start">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              提交后会有5秒倒计时，期间不能继续绘画，倒计时结束后自动进入下一题。
            </span>
          </li>

          <li className="flex items-start">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              请认真对待每一幅作品，
              <span className="text-red-500 font-bold">
                尽量让每一幅作品画出的东西不一样，充分发挥你的创造力
              </span>
              。
            </span>
          </li>

          <li className="flex items-start">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-bold">
              实验过程中请勿刷新页面或退出，否则数据会丢失
            </span>
            。
          </li>
        </ul>

        <button
          onClick={onStart}
          disabled={!canStart}
          className={`w-full sm:w-64 py-3 sm:py-4 rounded-xl text-white text-base sm:text-lg font-medium mx-auto block transition-all duration-300 transform
            ${
              canStart
                ? "bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-lg cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          {countdown > 0 ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white"
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
              请等待 {countdown} 秒后开始实验
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg
                className="mr-2 h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              我已了解，开始实验
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

export default Instructions;
