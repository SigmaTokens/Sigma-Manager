import express from 'express';
import path from 'path';

export const serveClient = (app: any) => {
    const clientBuildPath = path.join(__dirname, '../client/dist');
    
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(clientBuildPath));
    
      app.get('*', (req: any, res:any) => {
        res.sendFile(path.resolve(clientBuildPath, 'index.html'));
      });
    } else {
    
      app.get('*', (req: any, res:any) => {
        res.send("API is running in development mode. Use Vite for the client.");
      });
    }
}