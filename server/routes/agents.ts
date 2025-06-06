import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import ping from 'ping';
import {
  get_all_agents,
  get_agent_by_id,
  get_agent_by_uri,
  insert_agent,
  delete_agent_by_id,
  update_agent,
  verify_agent_by_id,
} from '../database/agents';
import { Globals } from '../globals';
import { Constants } from '../constants';

async function checkAgentStatus(ip: string, port: string): Promise<string> {
  try {
    const response = await fetch('http://' + ip + ':' + port + '/status', {
      //signal: AbortSignal.timeout(300),
    });
    return response.status == 200 ? 'online' : 'offline';
  } catch (error) {
    return 'offline';
  }
}

export function serveAgents() {
  const router = Router();

  router.get('/agents', async (req, res) => {
    try {
      const agents = await get_all_agents();

      res.json(agents);
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to fetch agents:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  router.post('/agents/add', async (req, res) => {
    try {
      const { id, ip, name, port } = req.body;

      if (!ip || !name || !port || !id) {
        res.status(400).json({ error: 'Missing required fields (id ,ip, name, port)' });
        return;
      }

      const agents = await get_all_agents();

      //TODO: change this to a query instead ...
      const agent_id_exists = agents.some((agent: any) => agent.agent_id === id);

      if (agent_id_exists) {
        await update_agent(id, ip, name, parseInt(port), 1);
      } else {
        await insert_agent(id, ip, name, parseInt(port), 1);
      }
      res.sendStatus(200);
    } catch (error: any) {
      console.error(Constants.TEXT_RED_COLOR, error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/agents/agent/:agent_id', async (req, res) => {
    const { agent_id } = req.params;
    try {
      const agent = await get_agent_by_id(agent_id);
      res.json(agent);
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to get agent:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  router.post('/agents/agent', async (req, res) => {
    const { agent_ip, agent_port } = req.body;
    try {
      const agent = await get_agent_by_uri(agent_ip, agent_port);
      res.json(agent);
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to get agent:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  router.delete('/agents/agent/:agent_id', async (req, res) => {
    try {
      const { agent_id } = req.params;

      await delete_agent_by_id(agent_id);

      const socket = Globals.agentSockets.get(agent_id);
      if (socket) {
        socket.emit('CLOSE_AGENT', (response: any) => {
          if (response.status === 'closed') {
            res.status(200).json({ success: true });
            return;
          }
        });
      } else {
        console.error(Constants.TEXT_RED_COLOR, 'failed getting socket for closing!');
        res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to erase agent:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ success: false });
      return;
    }
  });

  router.get('/agents/active_status', async (req, res) => {
    try {
      const agents = await get_all_agents();
      const statusUpdates = await Promise.all(
        agents.map(async (agent: any) => ({
          agent_id: agent.agent_id,
          status: await checkAgentStatus(agent.agent_ip, agent.agent_port),
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

      await verify_agent_by_id(agent_id);

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
    const { agent_id } = req.body;
    try {
      const agent = await get_agent_by_id(agent_id);

      const response_from_agent = await fetch(
        'http://' + agent.agent_ip + ':' + agent.agent_port + '/api/monitor/status',
        {
          //signal: AbortSignal.timeout(300),
          method: 'GET',
        },
      );
      if (response_from_agent.ok && response_from_agent.status === 200) {
        res.status(200).json({ success: 'monitoring' });
        return;
      }
      res.status(201).json({ success: 'not monitoring' });
      return;
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to check monitoring status', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
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
