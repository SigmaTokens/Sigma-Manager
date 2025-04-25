import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import ping from 'ping';
import {
  get_all_agents,
  insert_agent,
  delete_agent_by_id,
} from '../database/agents';
import { Globals } from '../globals';
import { Constants } from '../constants';

async function checkAgentStatus(ip: string, port: string): Promise<string> {
  try {
    const response = await fetch('http://' + ip + ':' + port + '/status', {
      signal: AbortSignal.timeout(500),
    });
    console.log(response.status);
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
      console.error('[-] Failed to fetch agents:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.post('/agents/text', async (req, res) => {
    try {
      const { ip, name, port } = req.body;

      if (!ip || !name || !port) {
        res
          .status(400)
          .json({ error: 'Missing required fields (ip, name, port)' });
        return;
      }

      const agents = await get_all_agents();

      const ipExists = agents.some((agent: any) => agent.agent_ip === ip);

      if (ipExists) {
        res.status(409).json({ error: 'Agent with this IP already exists' });
        return;
      }

      await insert_agent(uuidv4(), ip, name, parseInt(port));
      res.sendStatus(200);
    } catch (error: any) {
      console.error(Constants.TEXT_RED_COLOR, error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/agents/status', async (req, res) => {
    try {
      const agents = await get_all_agents();
      const statusUpdates = await Promise.all(
        agents.map(async (agent: any) => ({
          agent_id: agent.agent_id,
          status: await checkAgentStatus(agent.agent_ip, agent.agent_port),
        })),
      );
      res.json(statusUpdates);
    } catch (err) {
      console.error('[-] Failed to update agent statuses:', err);
      res.status(500).json({ error: 'Status update failed' });
    }
  });

  router.delete('/agents/agent/:agent_id', async (req, res) => {
    const { agent_id } = req.params;
    try {
      await delete_agent_by_id(agent_id);
      res.json({ success: true });
    } catch (error) {
      console.error('[-] Failed to delete agent:', error);
      res.status(500).json({ failure: error });
    }
  });

  Globals.app.use('/api', router);
}
