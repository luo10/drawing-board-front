export const challenges = [
  {
    title: "画一只可爱的小猫",
    drawBackground: (ctx) => {
      ctx.strokeStyle = "#ddd";
      ctx.beginPath();
      ctx.ellipse(300, 200, 100, 70, 0, 0, 2 * Math.PI);
      ctx.stroke();
      // 画两个三角形ears
      ctx.beginPath();
      ctx.moveTo(220, 140);
      ctx.lineTo(250, 100);
      ctx.lineTo(280, 140);
      ctx.moveTo(320, 140);
      ctx.lineTo(350, 100);
      ctx.lineTo(380, 140);
      ctx.stroke();
    },
  },
  {
    title: "画一朵美丽的花",
    drawBackground: (ctx) => {
      ctx.strokeStyle = "#ddd";
      ctx.beginPath();
      ctx.arc(300, 200, 50, 0, 2 * Math.PI);
      ctx.moveTo(300, 250);
      ctx.lineTo(300, 350);
      ctx.stroke();
    },
  },
  {
    title: "画一座山",
    drawBackground: (ctx) => {
      ctx.strokeStyle = "#ddd";
      ctx.beginPath();
      ctx.moveTo(100, 350);
      ctx.lineTo(300, 100);
      ctx.lineTo(500, 350);
      ctx.stroke();
    },
  },
  {
    title: "画一条小船",
    drawBackground: (ctx) => {
      ctx.strokeStyle = "#ddd";
      ctx.beginPath();
      ctx.moveTo(200, 250);
      ctx.lineTo(400, 250);
      ctx.lineTo(450, 300);
      ctx.lineTo(150, 300);
      ctx.closePath();
      ctx.stroke();
    },
  },
  {
    title: "画一棵大树",
    drawBackground: (ctx) => {
      ctx.strokeStyle = "#ddd";
      ctx.beginPath();
      ctx.moveTo(300, 350);
      ctx.lineTo(300, 150);
      ctx.moveTo(300, 150);
      ctx.arc(300, 150, 80, 0, Math.PI, true);
      ctx.stroke();
    },
  },
  {
    title: "画一个房子",
    drawBackground: (ctx) => {
      ctx.strokeStyle = "#ddd";
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
    },
  },
];
