import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // สำคัญสำหรับ Docker
    // Dev proxy — ส่ง /api ไปที่ backend อัตโนมัติ
    // DOCKER=true  → ใช้ชื่อ container "backend"
    // รัน local    → ใช้ localhost
    proxy: {
      '/api': {
        target: process.env.DOCKER
          ? 'http://backend:8000'
          : 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // แยก vendor chunks เพื่อ caching ที่ดีขึ้น
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['axios'],
        },
      },
    },
  },
});
