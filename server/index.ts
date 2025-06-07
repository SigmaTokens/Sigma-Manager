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
import { callback } from 'chart.js/dist/helpers/helpers.core';
import { get_honeytokens_by_agent_id } from './database/honeytokens';

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
    const agentId = socket.handshake.query.agentId as string;

    if (!agentId) {
      console.warn('Agent tried to connect without agentId');
      socket.disconnect();
      return;
    }

    console.log(Constants.TEXT_GREEN_COLOR, `Agent connected: ${agentId}`, Constants.TEXT_WHITE_COLOR);
    Globals.agentSockets.set(agentId, socket);

    socket.on('GET_HONEYTOKENS', async (payload, callback) => {
      const agent_id = payload;
      console.log(agent_id);
      try {
        const honeytokens = await get_honeytokens_by_agent_id(agent_id);
        callback({ tokens: honeytokens });
      } catch (err) {
        callback({ tokens: [] });
      }
    });

    socket.on('disconnect', () => {
      Globals.agentSockets.delete(agentId);
    });
  });

  Globals.app = app;

  startDatabase()
    .then(() => {
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
