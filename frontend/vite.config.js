import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/wedding/',
  server: {
    port: 5173,
    proxy: {
      // Only proxy API and auth to backend; Vite serves the SPA at /wedding/
      '/wedding/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/wedding/login': { target: 'http://localhost:8080', changeOrigin: true },
      '/wedding/logout': { target: 'http://localhost:8080', changeOrigin: true },
      '/wedding/styles.css': { target: 'http://localhost:8080', changeOrigin: true },
      '/wedding/images': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
