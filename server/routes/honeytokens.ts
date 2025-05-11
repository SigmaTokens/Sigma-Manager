import { Router } from 'express';
import {
  get_all_honeytokens,
  get_honeytoken_by_token_id,
  get_honeytokens_by_agent_id,
  get_honeytokens_by_type_id,
  get_honeytokens_by_group_id,
  delete_honeytoken_by_id,
  delete_honeytokens_by_type_id,
  delete_honeytokens_by_group_id,
  insert_honeytoken,
} from '../database/honeytokens';
import { Globals } from '../globals';
import { get_agent_by_id, get_agent_by_uri } from '../database/agents';
import { v4 as uuidv4 } from 'uuid';

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

  router.post('/honeytokens/text', async (req, res) => {
    try {
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

      const required = {
        type,
        file_name,
        location,
        grade,
        expiration_date,
        notes,
        data,
        agent_id,
      };

      for (const [field, value] of Object.entries(required)) {
        if (value === undefined || value === null || value === '') {
          res.status(400).json({ failure: `Missing required field: ${field}` });
          return;
        }
      }

      const agent = await get_agent_by_id(agent_id);

      const token_id = uuidv4();
      const group_id = uuidv4();

      await insert_honeytoken(
        agent_id,
        token_id,
        group_id,
        type,
        file_name,
        location,
        grade,
        new Date(),
        expiration_date,
        notes,
        data,
      );

      const response_from_agent = await fetch(
        'http://' +
          agent.agent_ip +
          ':' +
          agent.agent_port +
          '/api/honeytoken/add',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token_id: token_id,
            group_id: group_id,
            type: type,
            file_name: file_name,
            location: location,
            grade: grade,
            expiration_date: expiration_date,
            notes: notes,
            data: data,
          }),
        },
      );

      res.status(200).json({ success: 'nice' });
    } catch (error) {
      console.error({ failure: error });
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

  router.post('/honeytokens/agent', async (req, res) => {
    const { agent_ip, agent_port } = req.body;
    try {
      if (!agent_ip || !agent_port) {
        console.error('[-] missing params');
        res.status(500).json({ failure: 'missing params' });
        return;
      }

      console.log('agent ip: ', agent_ip);
      console.log('agent port: ', agent_port);

      const agent = await get_agent_by_uri(agent_ip, agent_port);

      if (!agent) {
        console.error('[-] agent not found');
        res.status(500).json({ failure: 'agent not found' });
        return;
      }

      if (agent.validated !== 0) {
        res.status(200).json([]);
        return;
      }

      const honeytokens = await get_honeytokens_by_agent_id(agent.agent_id);
      res.status(200).json(honeytokens || []);
      return;
    } catch (error) {
      console.error('[-] Failed to fetch honeytokens by agent_id:', error);
      res.status(444).json({ error: 'Internal server error' });
      return;
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
      const token = await get_honeytoken_by_token_id(token_id);
      if (token == undefined) {
        res.status(500).json({ failure: 'error' });
      }
      const agent = await get_agent_by_id(token.agent_id);
      if (agent != undefined) {
        const response_from_agent = await fetch(
          'http://' +
            agent.agent_ip +
            ':' +
            agent.agent_port +
            '/api/honeytoken/remove',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token_id: token_id,
            }),
          },
        );
      }
    } catch (error) {
      console.error('[-] Failed to delete honeytoken:', error);
      res.status(500).json({ failure: error });
    } finally {
      await delete_honeytoken_by_id(token_id);
      res.json({ success: true });
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

  router.put('/honeytokens/monitor_status', async (req, res) => {
    const { token_id } = req.body;
    try {
      const token = await get_honeytoken_by_token_id(token_id);
      const agent = await get_agent_by_id(token.agent_id);

      if (token == undefined || agent == undefined) {
        res.status(201).json({ success: 'not monitoring honeytoken' });
        return;
      }

      const response_from_agent = await fetch(
        'http://' +
          agent.agent_ip +
          ':' +
          agent.agent_port +
          '/api/honeytoken/status',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token_id: token_id,
          }),
        },
      );
      if (response_from_agent.ok && response_from_agent.status === 200) {
        console.log('monitoring honeytoken');
        res.status(200).json({ success: 'monitoring honeytoken' });
        return;
      }
      console.log('not monitoring honeytoken');
      res.status(201).json({ success: 'not monitoring honeytoken' });
      return;
    } catch (error) {
      console.error(
        '[-] Failed to check monitoring status for honeytoken',
        error,
      );
      res.status(500).json({ failure: error });
    }
  });

  router.put('/honeytokens/start', async (req, res) => {
    const { token_id } = req.body;
    try {
      const token = await get_honeytoken_by_token_id(token_id);

      const agent = await get_agent_by_id(token.agent_id);

      console.log('JOKER start:', token);
      console.log('JOKER start:', agent);

      const response_from_agent = await fetch(
        'http://' +
          agent.agent_ip +
          ':' +
          agent.agent_port +
          '/api/honeytoken/start',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token_id: token_id,
          }),
        },
      );
      if (response_from_agent.ok || response_from_agent.status === 200) {
        console.log('started monitor on honeytoken');
        res.status(200).json({ success: 'started monitor on honeytoken' });
        return;
      }

      console.log({ response_from_agent });
    } catch (error) {
      console.error('[-] Failed to start monitor on honeytoken:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.put('/honeytokens/stop', async (req, res) => {
    const { token_id } = req.body;
    try {
      const token = await get_honeytoken_by_token_id(token_id);
      const agent = await get_agent_by_id(token.agent_id);

      console.log('JOKER stop:', token);
      console.log('JOKER stop:', agent);

      const response_from_agent = await fetch(
        'http://' +
          agent.agent_ip +
          ':' +
          agent.agent_port +
          '/api/honeytoken/stop',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token_id: token_id,
          }),
        },
      );
      if (response_from_agent.ok && response_from_agent.status === 200) {
        console.log('stopped monitor on honeytoken!');
        res.status(200).json({ success: 'stopped monitor on honeytoken' });
        return;
      }
      console.log('nothing to stop!');
      res.status(201).json({ success: 'nothing to stop' });
      return;
    } catch (error) {
      console.error('[-] Failed to stop honeytoken:', error);
      res.status(500).json({ failure: error });
    }
  });

  Globals.app.use('/api', router);
}
