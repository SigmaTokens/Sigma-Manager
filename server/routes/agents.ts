const agentStatusMap: Record<string, string> = {};
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import ping from 'ping';
import { get_all_agents, insert_agent } from '../database/agents';
import { Globals } from '../globals';
import { Constants } from '../constants';

async function checkAgentStatus(ip: string): Promise<string> {
  try {
    const res = await ping.promise.probe(ip, { timeout: 2 });
    return res.alive ? 'online' : 'offline';
  } catch {
    return 'offline';
  }
}

export function serveAgents() {
  const router = Router();

  router.get('/agents', async (req, res) => {
    try {
      const agents = await get_all_agents();

      const agentsWithStatus = agents.map((agent: any) => ({
        agent_id: agent.agent_id,
        name: agent.agent_name,
        ip: agent.agent_ip,
        port: agent.agent_port,
        status: agentStatusMap[agent.agent_id] || 'unknown', // TODO: this needs to move to client - client needs to request the statuses every X seconds
      }));

      res.json(agentsWithStatus);
    } catch (error) {
      console.error('[-] Failed to fetch agents:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.post('/agents/text', async (req, res) => {
    try {
      const { ip, name, port } = req.body;
      await insert_agent(uuidv4(), ip, name, parseInt(port));
      res.send().status(200);
    } catch (error: any) {
      console.error(Constants.TEXT_RED_COLOR, error);
      res.status(500).json({ failure: error.message });
    }
  });

  // TODO: this needs to move to somewhere else and be in a while loop
  setInterval(async () => {
    try {
      const agents = await get_all_agents();
      for (const agent of agents) {
        const status = await checkAgentStatus(agent.agent_ip);
        agentStatusMap[agent.agent_id] = status;
      }
    } catch (err) {
      console.error('[-] Failed to update agent statuses:', err);
    }
  }, 5000);

  Globals.app.use('/api', router);
}
