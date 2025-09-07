import express from 'express';
import path from 'path';
import { Globals } from '../globals';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const serveClient = () => {
  const clientBuildPath = path.resolve(__dirname, '../../client/dist');

  if (process.env.MODE === process.env.MODE) {
    Globals.app.use(express.static(clientBuildPath));

    Globals.app.get('*', (req: any, res: any) => {
      res.sendFile(path.resolve(clientBuildPath, 'index.html'));
    });
  } else {
    Globals.app.get('*', (req: any, res: any) => {
      res.send('API is running in development mode. Use Vite for the client.');
    });
  }
};
