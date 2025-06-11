import { Router } from 'express';
import {
  get_all_user_agents,
  delete_user_agent_by_id,
  verify_user_agent_by_id,
  is_user_agent,
} from '../database/agents';
import { Globals } from '../globals';
import { Constants } from '../constants';
import { auth } from '../middleware/auth';
import { sseUpdateAgents } from './sse';

export function serveAgents() {
  const router = Router();

  router.use(auth());

  router.get('/agents', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const agents = await get_all_user_agents(user_id);

      if (!agents) return void res.status(200).json([]);

      return void res.status(200).json(agents);
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to fetch agents:', error, Constants.TEXT_DEFAULT_COLOR);
      return void res.status(500).json([]);
    }
  });

  router.delete('/agents/agent/:agent_id', async (req, res) => {
    try {
      const { agent_id } = req.params;
      const user_id: string = (req as any).user.id;

      const isOwner = await is_user_agent(user_id, agent_id);
      if (!isOwner) return void res.status(500).json({ success: false });

      const result = await delete_user_agent_by_id(agent_id, user_id);

      if (!result) return void res.status(500).json({ success: false });

      const socket = Globals.agentSockets.get(agent_id);
      if (socket) {
        socket.emit('CLOSE_AGENT', () => {
          socket.disconnect();
          sseUpdateAgents();
          return void res.status(200).json({ success: true });
        });
      } else {
        console.warn(Constants.TEXT_YELLOW_COLOR, 'failed getting socket for closing!');
        return void res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to erase agent:', error, Constants.TEXT_DEFAULT_COLOR);
      return void res.status(500).json({ success: false });
    }
  });

  router.get('/agents/verify/:agent_id', async (req, res) => {
    try {
      const { agent_id } = req.params;
      const user_id: string = (req as any).user.id;

      const result = await verify_user_agent_by_id(agent_id, user_id);

      if (!result) return void res.status(500).json({ success: false });

      sseUpdateAgents();
      return void res.status(200).json({ success: true });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to init:', error);
      return void res.status(500).json({ success: false });
    }
  });

  router.put('/agents/start', async (req, res) => {
    try {
      const { agent_id } = req.body;

      const socket = Globals.agentSockets.get(agent_id);
      if (socket)
        socket.emit('START_AGENT', (response: any) => {
          if (response.status === 'started') {
            sseUpdateAgents();
            return void res.status(200).json({ success: true });
          } else {
            return void res.status(500).json({ success: false });
          }
        });
      else {
        console.error(Constants.TEXT_RED_COLOR, 'Failed fetching socket to start!');
        return void res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to start agent:', error);
      return void res.status(500).json({ success: false });
    }
  });

  router.put('/agents/stop', async (req, res) => {
    try {
      const { agent_id } = req.body;

      const socket = Globals.agentSockets.get(agent_id);
      if (socket)
        socket.emit('STOP_AGENT', (response: any) => {
          if (response.status === 'stopped') {
            sseUpdateAgents();
            return void res.status(200).json({ success: true });
          } else {
            return void res.status(500).json({ success: false });
          }
        });
      else {
        console.error(Constants.TEXT_RED_COLOR, 'Failed fetching socket to stop!');
        return void res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to stop agent:', error);
      return void res.status(500).json({ success: false });
    }
  });

  Globals.app.use('/api', router);
}
