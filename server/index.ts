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
import cookieParser from 'cookie-parser';
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
import { Constants } from './constants';
import util from 'node:util';
import { create_honeytoken_alert } from './database/alerts';
import { get_all_agents, insert_agent } from './database/agents';
import { get_all_agent_honeytokens } from './database/honeytokens';
import { serveSSE, sseUpdateAgents } from './routes/sse';

main();

function main(): void {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  dotenv.config({ path: '../.env' });
  app.use(cookieParser());

  console.log(Constants.TEXT_MAGENTA_COLOR, 'SERVER_TEST=' + process.env.SERVER_TEST, Constants.TEXT_DEFAULT_COLOR);

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

    console.log(Constants.TEXT_GREEN_COLOR, `Agent connected: ${agentId}`, Constants.TEXT_DEFAULT_COLOR);
    Globals.agentSockets.set(agentId, socket);

    socket.on('GET_HONEYTOKENS', async (payload, callback) => {
      const agent_id = payload;
      console.log('agent id:', agent_id);
      try {
        const honeytokens = await get_all_agent_honeytokens(agent_id);
        callback({ tokens: honeytokens });
      } catch (err) {
        callback({ tokens: [] });
      }
    });

    socket.on('REGISTER_AGENT', async (payload) => {
      const { agent_id, agent_name, user_id } = payload;

      const agents = await get_all_agents();

      const agent_id_exists = agents.some((agent: any) => agent.agent_id === agent_id);

      if (!agent_id_exists) {
        const result = await insert_agent(agent_id, agent_name, user_id);
        if (result) console.log(`created agent ${agent_name} successfully`);
      }

      sseUpdateAgents();
    });

    socket.on('CREATE_ALERT', async (payload) => {
      try {
        const { token_id, alert_epoch, accessed_by, log } = payload;

        const result = await create_honeytoken_alert(token_id, alert_epoch, accessed_by, log);

        if (result) console.log('created alert successfully!');
      } catch (error: any) {
        console.error(Constants.TEXT_RED_COLOR, 'Failed to create alert:', error.message, Constants.TEXT_DEFAULT_COLOR);
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
        Constants.TEXT_DEFAULT_COLOR,
        app.locals.db,
      );

      serveSSE();
      serveUsers();
      serveHome();
      serveHoneytokens();
      serveAlerts();
      serveAgents();
      serveClient();

      Globals.server = httpServer.listen(port, () => {
        console.log(
          Constants.TEXT_MAGENTA_COLOR,
          `Server + WebSocket running on port ${port}`,
          Constants.TEXT_DEFAULT_COLOR,
        );
      });
    })
    .catch((error) => {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to initialize server:', error, Constants.TEXT_DEFAULT_COLOR);
      process.exit(1);
    });
}
