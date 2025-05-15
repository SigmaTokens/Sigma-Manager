import express from 'express';
import path from 'path';
import { Globals } from '../globals';

export const serveClient = () => {
  const clientBuildPath = path.join(__dirname, '../client/dist');

  if (process.env.MODE === 'prod') {
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
