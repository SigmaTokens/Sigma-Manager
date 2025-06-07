process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT', err);
  console.error('Type:', err.constructor?.name);
  console.error('Stack:', err.stack);
  process.exit(1);
});
process.on('unhandledRejection', (reason, p) => {
  console.error('UNHANDLED PROMISE', p, 'reason:', reason);
});

process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error) {
    console.error('UNHANDLED REJECTION →', reason.stack); // full stack
  } else {
    console.error(
      'UNHANDLED REJECTION →',
      util.inspect(reason, { depth: null, colors: true }), // pretty-print
    );
  }
});

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import { serveClient } from './routes/client';
import { serveHoneytokens } from './routes/honeytokens';
import { serveUsers } from './routes/users';
import { serveAlerts } from './routes/alerts';
import { startDatabase } from './database/database';
import { Globals } from './globals';
import { serveAgents } from './routes/agents';
import { serveHome } from './routes/home';
import { serveGeneral } from './routes/general';
import { Constants } from './constants';
import util from 'node:util';

main();

function main(): void {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  dotenv.config({ path: '../.env' });

  console.log(Constants.TEXT_MAGENTA_COLOR, 'SERVER_TEST=' + process.env.SERVER_TEST, Constants.TEXT_WHITE_COLOR);

  const port = process.env.PORT || 3000;

  const httpServer = createServer(app);

  const io = new IOServer(httpServer, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('connection received...');
    const agentId = socket.handshake.query.agentId as string;

    if (!agentId) {
      console.warn('Agent tried to connect without agentId');
      socket.disconnect();
      return;
    }

    //receiving
    console.log(`✅ Agent connected: ${agentId}`);
    Globals.agentSockets.set(agentId, socket);

    socket.on('message', (message) => {
      console.log(`💬 Message from ${agentId}:`, message);
    });

    socket.on('statusUpdate', ({ status }) => {
      console.log(`📡 Status from ${agentId}:`, status);
    });

    socket.on('alertUpdate', ({ alert }) => {
      console.log(`⚠️ Alert from ${agentId}:`, alert);
    });

    socket.on('disconnect', () => {
      console.log(`⛔ Agent disconnected: ${agentId}`);
      Globals.agentSockets.delete(agentId);
    });
    //

    //sending
    socket.emit('command', { action: 'TEST', payload: { title: 'name' } });
    //
  });

  Globals.app = app;

  startDatabase()
    .then((database) => {
      console.log(
        Constants.TEXT_CYAN_COLOR,
        'Database connection initialized:',
        Constants.TEXT_WHITE_COLOR,
        app.locals.db,
      );

      serveUsers();
      serveGeneral();
      serveHome();
      serveHoneytokens();
      serveAlerts();
      serveAgents();
      serveClient();

      app.use((err: unknown, _req: any, res: any, _next: any) => {
        if (err instanceof Error) {
          console.error('API ERROR →', err.stack);
        } else {
          console.error('API ERROR →', util.inspect(err, { depth: null }));
        }
        res.status(500).json({ message: 'Internal server error' });
      });

      Globals.server = httpServer.listen(port, () => {
        console.log(
          Constants.TEXT_MAGENTA_COLOR,
          `Server + WebSocket running on port ${port}`,
          Constants.TEXT_WHITE_COLOR,
        );
      });
    })
    .catch((error) => {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to initialize server:', error, Constants.TEXT_WHITE_COLOR);
      process.exit(1);
    });
}
