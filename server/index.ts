import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { serveClient } from './routes/client';
import { serveHoneytokens } from './routes/honeytokens';
import { serveUsers } from './routes/users';
import { serveAlerts } from './routes/alerts';
import { startDatabase } from './database/database';
import { Globals } from './globals';
import { serveAgents } from './routes/agents';
import { Constants } from './constants';
import { create_honeytoken_alert } from './database/alerts';
import { get_all_agents, insert_agent } from './database/agents';
import { get_all_agent_honeytokens } from './database/honeytokens';
import { serveSSE, sseUpdateAgents, sseUpdateAlerts } from './routes/sse';

main();

function main(): void {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  dotenv.config({ path: '../.env' });
  app.use(cookieParser());

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
      try {
        const honeytokens = await get_all_agent_honeytokens(agent_id);
        callback({ tokens: honeytokens });
      } catch {
        callback({ tokens: [] });
      }
    });

    socket.on('REGISTER_AGENT', async (payload) => {
      const { agent_id, agent_name, user_id } = payload;

      const agents = await get_all_agents();

      const agent_id_exists = agents.some((agent: any) => agent.agent_id === agent_id);

      if (!agent_id_exists) {
        const result = await insert_agent(agent_id, agent_name, user_id);
        if (result)
          console.log(
            Constants.TEXT_GREEN_COLOR,
            `created agent ${agent_name} successfully`,
            Constants.TEXT_DEFAULT_COLOR,
          );
      }

      sseUpdateAgents();
    });

    socket.on('CREATE_ALERT', async (payload) => {
      try {
        const { token_id, alert_epoch, accessed_by, log } = payload;

        console.log(
          Constants.TEXT_CYAN_COLOR,
          '[Start] Found API-Endpoint honeytoken alert, the current unix epoch time is:',
          Math.floor(alert_epoch),
          Constants.TEXT_DEFAULT_COLOR,
        );

        const result = await create_honeytoken_alert(token_id, alert_epoch, accessed_by, log);
        sseUpdateAlerts();

        if (!result) console.log(Constants.TEXT_RED_COLOR, 'Failed to create alert!', Constants.TEXT_DEFAULT_COLOR);
      } catch (error: any) {
        console.error(Constants.TEXT_RED_COLOR, 'Failed to create alert:', error.message, Constants.TEXT_DEFAULT_COLOR);
      }

      console.log(
        Constants.TEXT_MAGENTA_COLOR,
        '[End] Registered API-Endpoint honeytoken alert, the current unix epoch time is:',
        Math.floor(Date.now()),
        Constants.TEXT_DEFAULT_COLOR,
      );
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

      serveUsers();
      serveSSE();
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
      console.error(Constants.TEXT_RED_COLOR, 'Failed to initialize sigmatokens:', error, Constants.TEXT_DEFAULT_COLOR);
      process.exit(1);
    });
}
