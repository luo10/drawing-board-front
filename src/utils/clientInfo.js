// 获取浏览器信息
export const getBrowserInfo = (userAgent) => {
  if (userAgent.includes("Firefox")) return "Firefox";
  else if (userAgent.includes("Chrome")) return "Chrome";
  else if (userAgent.includes("Safari")) return "Safari";
  else if (userAgent.includes("Edge")) return "Edge";
  else if (userAgent.includes("MSIE") || userAgent.includes("Trident/"))
    return "IE";
  else return "Unknown";
};

// 获取操作系统信息
export const getOSInfo = (userAgent) => {
  if (userAgent.includes("Windows")) return "Windows";
  else if (userAgent.includes("Mac")) return "MacOS";
  else if (userAgent.includes("Linux")) return "Linux";
  else if (userAgent.includes("Android")) return "Android";
  else if (
    userAgent.includes("iOS") ||
    userAgent.includes("iPhone") ||
    userAgent.includes("iPad")
  )
    return "iOS";
  else return "Unknown";
};

// 获取设备类型
export const getDeviceInfo = (userAgent) => {
  if (userAgent.includes("Mobile")) return "Mobile";
  else if (userAgent.includes("Tablet")) return "Tablet";
  else return "Desktop";
};

// 获取设备完整信息
export const getFullDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  return {
    browser: getBrowserInfo(userAgent),
    os: getOSInfo(userAgent),
    device: getDeviceInfo(userAgent),
  };
};

// 获取IP地址
export const getIpAddress = async () => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("获取IP地址失败", error);
    return "unknown";
  }
};
