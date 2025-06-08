import { Router } from 'express';
import {
  get_all_user_agents,
  get_user_agent_by_id,
  get_user_agent_by_uri,
  insert_user_agent,
  delete_user_agent_by_id,
  update_user_agent,
  verify_user_agent_by_id,
} from '../database/agents';
import { Globals } from '../globals';
import { Constants } from '../constants';
import { auth } from '../middleware/auth';

async function checkAgentStatus(id: string): Promise<string> {
  try {
    const socket = Globals.agentSockets.get(id);
    if (socket && socket.connected) return 'online';
    return 'offline';
  } catch (error) {
    return 'offline';
  }
}

export function serveAgents() {
  const router = Router();

  router.use(auth());

  //✔️
  router.get('/agents', async (req, res) => {
    try {
      console.log('user fetched data from verified token', (req as any).user);
      const user_id: string = (req as any).user.id;
      const agents = await get_all_user_agents(user_id);

      if (!agents) return void res.status(200).json([]);

      return void res.status(200).json(agents);
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to fetch agents:', error, Constants.TEXT_WHITE_COLOR);
      return void res.status(500).json([]);
    }
  });
  //❌
  router.post('/agents/add', async (req, res) => {
    try {
      const { id, ip, name, port } = req.body;

      if (!ip || !name || !port || !id) return void res.status(500).json({ success: false });

      const user_id: string = (req as any).user.id;
      const agents = await get_all_user_agents(user_id);

      const agent_id_exists = agents.some((agent: any) => agent.agent_id === id);

      let result = false;

      if (agent_id_exists) result = await update_user_agent(id, ip, name, parseInt(port), user_id);
      else result = await insert_user_agent(id, ip, name, parseInt(port), user_id);

      if (!result) return void res.status(500).json({ success: false });

      return void res.status(200).json({ success: true });
    } catch (error: any) {
      console.error(Constants.TEXT_RED_COLOR, error);
      return void res.status(500).json({ success: false });
    }
  });
  //
  router.get('/agents/agent/:agent_id', async (req, res) => {
    const { agent_id } = req.params;
    const user_id: string = (req as any).user.id;
    try {
      const agent = await get_user_agent_by_id(agent_id, user_id);
      res.json(agent);
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to get agent:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  router.post('/agents/agent', async (req, res) => {
    const user_id: string = (req as any).user.id;
    const { agent_ip, agent_port } = req.body;
    try {
      const agent = await get_user_agent_by_uri(agent_ip, agent_port, user_id);
      res.json(agent);
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to get agent:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  router.delete('/agents/agent/:agent_id', async (req, res) => {
    try {
      const { agent_id } = req.params;
      const user_id: string = (req as any).user.id;
      await delete_user_agent_by_id(agent_id, user_id);

      const socket = Globals.agentSockets.get(agent_id);
      if (socket) {
        socket.emit('CLOSE_AGENT', (response: any) => {
          if (response.status === 'closed') {
            return void res.status(200).json({ success: true });
          }
        });
      }
      console.warn(Constants.TEXT_YELLOW_COLOR, 'failed getting socket for closing!');
      return void res.status(200).json({ success: true });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to erase agent:', error, Constants.TEXT_WHITE_COLOR);
      return void res.status(500).json({ success: false });
    }
  });

  router.get('/agents/active_status', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const agents = await get_all_user_agents(user_id);
      const statusUpdates = await Promise.all(
        agents.map(async (agent: any) => ({
          agent_id: agent.agent_id,
          status: await checkAgentStatus(agent.agent_id),
        })),
      );
      res.status(200).json(statusUpdates);
    } catch (err) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to update agent statuses:', err, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ error: 'Status update failed' });
    }
  });

  router.get('/agents/verify/:agent_id', async (req, res) => {
    try {
      const { agent_id } = req.params;
      const user_id: string = (req as any).user.id;

      await verify_user_agent_by_id(agent_id, user_id);

      const socket = Globals.agentSockets.get(agent_id);
      if (socket) {
        socket.emit('INIT_AGENT', (response: any) => {
          if (response.status === 'initiated') {
            res.status(200).json({ success: true });
            return;
          }
        });
      } else {
        console.error(Constants.TEXT_RED_COLOR, 'Failed fetching socket to init!');
        res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to init:', error);
      res.status(500).json({ success: false });
      return;
    }
  });

  router.put('/agents/monitor_status', async (req, res) => {
    try {
      const { agent_id } = req.body;

      const socket = Globals.agentSockets.get(agent_id);
      if (socket) {
        socket.emit('STATUS_AGENT', (response: any) => {
          if (response.status === 'monitoring') {
            res.status(200).json({ success: 'monitoring' });
            return;
          }
          res.status(201).json({ success: 'not monitoring' });
          return;
        });
      } else res.status(500).json({ success: 'not monitoring' });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to get agent monitoring status:', error);
      res.status(500).json({ success: 'not monitoring' });
      return;
    }
  });

  router.put('/agents/start', async (req, res) => {
    try {
      const { agent_id } = req.body;

      const socket = Globals.agentSockets.get(agent_id);
      if (socket) {
        socket.emit('START_AGENT', (response: any) => {
          if (response.status === 'started') {
            res.status(200).json({ success: true });
            return;
          }
        });
      } else {
        console.error(Constants.TEXT_RED_COLOR, 'Failed fetching socket to start!');
        res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to start agent:', error);
      res.status(500).json({ success: false });
      return;
    }
  });

  router.put('/agents/stop', async (req, res) => {
    try {
      const { agent_id } = req.body;

      const socket = Globals.agentSockets.get(agent_id);
      if (socket) {
        socket.emit('STOP_AGENT', (response: any) => {
          if (response.status === 'stopped') {
            res.status(200).json({ success: true });
            return;
          }
        });
      } else {
        console.error(Constants.TEXT_RED_COLOR, 'Failed fetching socket to stop!');
        res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to stop agent:', error);
      res.status(500).json({ success: false });
      return;
    }
  });

  Globals.app.use('/api', router);
}
