import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // 关键：允许通过预览域名访问；避免 vite 6+ 的 host 校验拦截
    allowedHosts: true,
    // 让 HMR 通过 https 反向代理回连
    hmr: {
      clientPort: 443,
      protocol: 'wss',
    },
  },
  // 强制把 echarts-for-react 和它的 peer 依赖 tslib 一起预构建
  optimizeDeps: {
    include: ['echarts-for-react', 'tslib', 'echarts'],
  },
});
