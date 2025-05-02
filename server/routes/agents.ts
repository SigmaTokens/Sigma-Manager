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
      signal: AbortSignal.timeout(300),
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
      console.error('[-] Failed to fetch agents:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.post('/agents/add', async (req, res) => {
    console.log('yues!');
    try {
      console.log(req.body);
      const { id, ip, name, port } = req.body;

      if (!ip || !name || !port || !id) {
        console.log('error!');
        res
          .status(400)
          .json({ error: 'Missing required fields (id ,ip, name, port)' });
        return;
      }

      const agents = await get_all_agents();

      //TODO: change this to a query instead ...
      const agent_id_exists = agents.some(
        (agent: any) => agent.agent_id === id,
      );

      if (agent_id_exists) {
        console.log('hjelp1');
        await update_agent(id, ip, name, parseInt(port));
      } else {
        console.log('hjelp2');
        await insert_agent(id, ip, name, parseInt(port));
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
      console.error('[-] Failed to get agent:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.post('/agents/agent', async (req, res) => {
    const { agent_ip, agent_port } = req.body;
    try {
      const agent = await get_agent_by_uri(agent_ip, agent_port);
      res.json(agent);
    } catch (error) {
      console.error('[-] Failed to get agent:', error);
      res.status(500).json({ failure: error });
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

  router.get('/agents/active_status', async (req, res) => {
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

  router.get('/agents/verify/:agent_id', async (req, res) => {
    console.log('help');
    try {
      const { agent_id } = req.params;

      await verify_agent_by_id(agent_id);
      res.json({ success: true });
    } catch (err) {
      console.error(Constants.TEXT_RED_COLOR, 'Error: ', err);
    }
  });

  router.put('/agents/monitor_status', async (req, res) => {
    const { agent_id } = req.body;
    try {
      const agent = await get_agent_by_id(agent_id);

      const response_from_agent = await fetch(
        'http://' +
          agent.agent_ip +
          ':' +
          agent.agent_port +
          '/api/monitor/status',
        {
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
      console.error('[-] Failed to check monitoring status', error);
      res.status(500).json({ failure: error });
    }
  });

  router.put('/agents/start', async (req, res) => {
    const { agent_id } = req.body;
    try {
      const agent = await get_agent_by_id(agent_id);

      const response_from_agent = await fetch(
        'http://' +
          agent.agent_ip +
          ':' +
          agent.agent_port +
          '/api/monitor/start',
        {
          method: 'GET',
        },
      );
      if (response_from_agent.ok || response_from_agent.status === 200) {
        res.status(200).json({ success: 'started' });
        return;
      }

      console.log({ response_from_agent });
    } catch (error) {
      console.error('[-] Failed to start agent:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.put('/agents/stop', async (req, res) => {
    const { agent_id } = req.body;
    try {
      const agent = await get_agent_by_id(agent_id);

      const response_from_agent = await fetch(
        'http://' +
          agent.agent_ip +
          ':' +
          agent.agent_port +
          '/api/monitor/stop',
        {
          method: 'GET',
        },
      );
      if (response_from_agent.ok && response_from_agent.status === 200) {
        res.status(200).json({ success: 'stopped' });
        return;
      }
      res.status(201).json({ success: 'nothing to stop' });
      return;
    } catch (error) {
      console.error('[-] Failed to stop agent:', error);
      res.status(500).json({ failure: error });
    }
  });

  Globals.app.use('/api', router);
}
