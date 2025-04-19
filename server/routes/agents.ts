const agentStatusMap: Record<string, string> = {};
import { Router, Express } from 'express';
import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import ping from 'ping';
import { get_all_agents, insert_agent } from '../database/agents';

async function checkAgentStatus(ip: string): Promise<string> {
  try {
    const res = await ping.promise.probe(ip, { timeout: 2 });
    return res.alive ? 'online' : 'offline';
  } catch {
    return 'offline';
  }
}

export function serveAgents(
  app: Express,
  database: Database<sqlite3.Database, sqlite3.Statement>,
) {
  const router = Router();

  router.get('/agents', async (req, res) => {
    try {
      const agents = await get_all_agents();

      const agentsWithStatus = agents.map((agent: any) => ({
        agent_id: agent.agent_id,
        name: agent.agent_name,
        ip: agent.agent_ip,
        port: agent.agent_port,
        status: agentStatusMap[agent.agent_id] || 'unknown',
        agent,
      }));

      res.json(agentsWithStatus);
    } catch (error) {
      console.error('[-] Failed to fetch agents:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.get('/agents/agent/:agent_id', async (req, res) => {
    const { agent_id } = req.params;
    try {
      //   const agent = await get_agent_by_agent_id(database, agent_id);
      //   res.json(agent);
    } catch (error) {
      console.error('[-] Failed to fetch agent by agent_id:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.get('/agent/ip/:ip', async (req, res) => {
    const { ip } = req.params;
    try {
      //   const agent = await get_agent_by_ip(database, ip);
      //   res.json(agent);
    } catch (error) {
      console.error('[-] Failed to fetch agent by ip:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.delete('/agents/agent/:agent_id', async (req, res) => {
    const { agent_id } = req.params;
    try {
      //   await delete_agent_by_id(database, agent_id);
      res.json({ success: true });
    } catch (error) {
      console.error('[-] Failed to delete agent:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.post('/agents/text', async (req, res) => {
    try {
      console.log(req.body);
      const { ip, name, port } = req.body;

      console.log('help');
      console.log('req.body:', req.body);

      await insert_agent(uuidv4(), ip, name, port);

      res.send().status(200);
    } catch (error: any) {
      res.status(500).json({ failure: error.message });
    }
  });

  setInterval(async () => {
    try {
      const agents = await get_all_agents();
      for (const agent of agents) {
        const status = await checkAgentStatus(agent.agent_ip);
        agentStatusMap[agent.agent_id] = status;
      }
      if (process.env.MODE === 'dev')
        console.log('[+] Updated agent statuses:', agentStatusMap);
    } catch (err) {
      console.error('[-] Failed to update agent statuses:', err);
    }
  }, 5000);

  app.use('/api', router);
}
