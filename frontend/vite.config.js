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
      // GET /wedding/login → serve SPA (so logout redirect doesn’t 404). POST → proxy to backend.
      '/wedding/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass(req) {
          if (req.method === 'GET') return '/wedding/';
        },
      },
      '/wedding/logout': { target: 'http://localhost:8080', changeOrigin: true },
      // GET /wedding/admin → serve SPA so admin page loads in dev
      '/wedding/admin': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass(req) {
          if (req.method === 'GET') return '/wedding/';
        },
      },
      '/wedding/styles.css': { target: 'http://localhost:8080', changeOrigin: true },
      '/wedding/images': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
