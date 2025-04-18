import { Router, Express } from 'express';
import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
// import {
//   get_all_agents,
//   get_agent_by_agent_id,
//   get_agent_by_ip,
//   delete_agent_by_id,
//   insert_agent,
// } from "../../database/agents";
import { Agent } from '../classes/Agent';

//fix: currently it's just a dummy...
export function serveAgents(
  app: Express,
  database: Database<sqlite3.Database, sqlite3.Statement>,
) {
  const router = Router();

  router.get('/agents', async (req, res) => {
    try {
      //   const agents = await get_all_agents(database);
      //   res.json(agents);
      res.json({ agent_id: '007', ip: '127.0.0.1', notes: 'none' });
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

  router.post('/agent/text', (req, res) => {
    try {
      console.log(req.body);
      const { ip, notes } = req.body;

      console.log('help');

      const newAgent = new Agent(uuidv4(), ip, notes);

      //   insert_agent(
      //     database,
      //     newAgent.getAgentID(),
      //     newAgent.getIP(),
      //     newAgent.getNotes()
      //   );

      res.send().status(200);
    } catch (error: any) {
      res.status(500).json({ failure: error.message });
    }
  });

  app.use('/api', router);
}
