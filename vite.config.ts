import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'grao.leandrofelix.dev.br',
      '.leandrofelix.dev.br',
    ],
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
  ssr: {
    noExternal: ['styled-components', 'react-router'],
  },
});
