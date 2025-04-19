import { Router } from 'express';
import {
  get_all_honeytokens,
  get_honeytoken_by_token_id,
  get_honeytokens_by_type_id,
  get_honeytokens_by_group_id,
  delete_honeytoken_by_id,
  delete_honeytokens_by_type_id,
  delete_honeytokens_by_group_id,
} from '../database/honeytokens';
import { Globals } from '../globals';
import { get_agent } from '../database/agents';

export function serveHoneytokens() {
  const router = Router();

  router.get('/honeytokens', async (req, res) => {
    try {
      const honeytokens = await get_all_honeytokens();
      res.json(honeytokens);
    } catch (error) {
      console.error('[-] Failed to fetch honeytokens:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.post('/honeytoken/text', async (req, res) => {
    try {
      console.log(req.body);

      // TODO: write the honeytoken to the database
      // TODO: send the honeytoken for creation to the agent

      const {
        type,
        file_name,
        location,
        grade,
        expiration_date,
        notes,
        data,
        agent_id,
      } = req.body;

      const agent = await get_agent(agent_id);

      console.log(agent);
    } catch (error) {
      console.error('error');
      res.status(500).json({ failure: error });
    }
  });

  router.get('/honeytokens/token/:token_id', async (req, res) => {
    const { token_id } = req.params;
    try {
      const honeytoken = await get_honeytoken_by_token_id(token_id);
      res.json(honeytoken);
    } catch (error) {
      console.error('[-] Failed to fetch honeytoken by token_id:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.get('/honeytokens/type/:type_id', async (req, res) => {
    const { type_id } = req.params;
    try {
      const honeytokens = await get_honeytokens_by_type_id(type_id);
      res.json(honeytokens);
    } catch (error) {
      console.error('[-] Failed to fetch honeytokens by type_id:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.get('/honeytokens/group/:group_id', async (req, res) => {
    const { group_id } = req.params;
    try {
      const honeytokens = await get_honeytokens_by_group_id(group_id);
      res.json(honeytokens);
    } catch (error) {
      console.error('[-] Failed to fetch honeytokens by group_id:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.delete('/honeytokens/token/:token_id', async (req, res) => {
    const { token_id } = req.params;
    try {
      await delete_honeytoken_by_id(token_id);
      res.json({ success: true });
    } catch (error) {
      console.error('[-] Failed to delete honeytoken:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.delete('/honeytokens/type/:type_id', async (req, res) => {
    const { type_id } = req.params;
    try {
      await delete_honeytokens_by_type_id(type_id);
      res.json({ success: true });
    } catch (error) {
      console.error('[-] Failed to delete honeytokens:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.delete('/honeytokens/group/:group_id', async (req, res) => {
    const { group_id } = req.params;
    try {
      await delete_honeytokens_by_group_id(group_id);
      res.json({ success: true });
    } catch (error) {
      console.error('[-] Failed to delete honeytokens:', error);
      res.status(500).json({ failure: error });
    }
  });

  Globals.app.use('/api', router);
}
