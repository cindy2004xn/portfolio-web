import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';

// GitHub Pages serves 404.html for unknown routes — copy index.html so SPA routing works on direct URL access
const ghPagesSpaFallback = {
  name: 'gh-pages-spa-fallback',
  closeBundle() {
    try { copyFileSync('./dist/index.html', './dist/404.html'); } catch (_) {}
  },
};

export default defineConfig({
  plugins: [react(), ghPagesSpaFallback],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    outDir: 'dist',
  },
});
