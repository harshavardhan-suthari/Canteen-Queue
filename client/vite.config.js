import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = 'Canteen-Queue';

export default defineConfig({
  base: `/${repoName}/`,
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  }
});
