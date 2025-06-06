import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envFolder = resolve(__dirname, '..'); //  .. = parent of vite.config

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envFolder, '');
  return {
    envDir: envFolder,
    envPrefix: 'VITE_',

    plugins: [react(), wasm()],

    server: {
      proxy: {
        '/api': {
          target: env.VITE_SERVER_URL ?? 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  };
});
