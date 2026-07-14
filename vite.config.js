import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    /* 預設只掛 IPv6 的 [::1]，瀏覽器把 localhost 解析成 127.0.0.1 時會連不上。
       明確掛 IPv4 迴環位址，localhost 兩種解析都通。 */
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
});
