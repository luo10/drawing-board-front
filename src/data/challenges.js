function rds(degrees) {
  return (degrees * Math.PI) / 180;
}

function drawBackground(ctx) {
  // 获取画布中心点
  const centerX = 250;
  const centerY = 250;

  ctx.strokeStyle = "#000";
  // 绘制一个缺少左下角1/3部分的圆
  ctx.beginPath();
  // 圆的参数: 在画布中央偏右上方，半径70
  ctx.arc(centerX + 50, centerY - 50, 70, rds(-180 + 10), rds(70), false);
  ctx.stroke();

  const squareSize = 80;
  // 方块位置调整到画布中央偏左下方
  const squareX = centerX - 100;
  const squareY = centerY + 20;
  const cornerLengthC = 15; // 每个角绘制的线段长度
  const cornerLengthD = 50; // 每个角绘制的线段长度

  // 绘制左上角
  ctx.beginPath();
  ctx.moveTo(squareX, squareY);
  ctx.lineTo(squareX + cornerLengthC, squareY); // 水平线
  ctx.moveTo(squareX, squareY);
  ctx.lineTo(squareX, squareY + cornerLengthD); // 垂直线
  ctx.stroke();

  // 绘制右下角
  ctx.beginPath();
  ctx.moveTo(squareX + squareSize, squareY + squareSize);
  ctx.lineTo(squareX + squareSize - cornerLengthD, squareY + squareSize); // 水平线
  ctx.moveTo(squareX + squareSize, squareY + squareSize);
  ctx.lineTo(squareX + squareSize, squareY + squareSize - cornerLengthC); // 垂直线
  ctx.stroke();
}

export const challenges = [
  {
    title:
      "请你将屏幕方框内的显示的线条及图形补全，使之成为有一定含义且有创意的图画。5分钟的时间内，你能想多少就画多少。",
    tips: "完成后点击下方的完成绘画按钮",
    drawBackground,
  },
  {
    title:
      "请你将屏幕方框内的显示的线条及图形补全，使之成为有一定含义且有创意的图画。5分钟的时间内，你能想多少就画多少。",
    tips: "尽量与之前的绘图任务不重复, 完成后点击下方的完成绘画按钮",
    drawBackground,
  },
  {
    title:
      "请你将屏幕方框内的显示的线条及图形补全，使之成为有一定含义且有创意的图画。5分钟的时间内，你能想多少就画多少。",
    tips: "尽量与之前的绘图任务不重复, 完成后点击下方的完成绘画按钮",
    drawBackground,
  },
  {
    title:
      "请你将屏幕方框内的显示的线条及图形补全，使之成为有一定含义且有创意的图画。5分钟的时间内，你能想多少就画多少。",
    tips: "尽量与之前的绘图任务不重复, 完成后点击下方的完成绘画按钮",
    drawBackground,
  },
  {
    title:
      "请你将屏幕方框内的显示的线条及图形补全，使之成为有一定含义且有创意的图画。5分钟的时间内，你能想多少就画多少。",
    tips: "尽量与之前的绘图任务不重复, 完成后点击下方的完成绘画按钮",
    drawBackground,
  },
  {
    title:
      "请你将屏幕方框内的显示的线条及图形补全，使之成为有一定含义且有创意的图画。5分钟的时间内，你能想多少就画多少。",
    tips: "尽量与之前的绘图任务不重复, 完成后点击下方的完成绘画按钮",
    drawBackground,
  },
];
