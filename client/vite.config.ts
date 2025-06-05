import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_SERVER_URL = 'http://localhost:3000' } = loadEnv(mode, path.resolve(__dirname, '../'), '');

  return {
    plugins: [react(), wasm(), topLevelAwait()],
    server: {
      proxy: {
        '/api': {
          target: VITE_SERVER_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
