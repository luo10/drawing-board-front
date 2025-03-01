import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/drawing-front/",
  server: {
    host: "0.0.0.0", // 允许通过IP访问
    port: 5173, // 默认端口
  },
});
