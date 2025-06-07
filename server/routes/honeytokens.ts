import { Router } from 'express';
import {
  get_all_honeytokens,
  get_honeytoken_by_token_id,
  get_honeytokens_by_type_id,
  get_honeytokens_by_group_id,
  delete_honeytoken_by_id,
  delete_honeytokens_by_type_id,
  delete_honeytokens_by_group_id,
  insert_honeytoken,
} from '../database/honeytokens';
import { Globals } from '../globals';
import { get_agent_by_id } from '../database/agents';
import { v4 as uuidv4 } from 'uuid';
import { Constants } from '../constants';

export function serveHoneytokens() {
  const router = Router();

  router.get('/honeytokens', async (req, res) => {
    try {
      const honeytokens = await get_all_honeytokens();
      res.json(honeytokens);
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to fetch honeytokens:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  router.post('/honeytokens/text', async (req, res) => {
    try {
      const { type, file_name, location, grade, expiration_date, notes, data, agent_id } = req.body;

      const required = {
        type,
        file_name,
        location,
        grade,
        expiration_date,
        agent_id,
      };

      for (const [field, value] of Object.entries(required)) {
        if (value === undefined || value === null || value === '') {
          console.log(`Missing required field: ${field}`);
          res.status(500).json({ success: false });
          return;
        }
      }

      const token_id = uuidv4();
      const group_id = uuidv4();

      await insert_honeytoken(
        agent_id,
        token_id,
        group_id,
        type,
        file_name,
        location,
        '',
        '',
        grade,
        new Date(),
        expiration_date,
        notes,
        '',
        data,
        0,
        '1',
      );

      const token_data = {
        token_id: token_id,
        group_id: group_id,
        type: type,
        file_name: file_name,
        location: location,
        grade: grade,
        expiration_date: expiration_date,
        notes: notes,
        data: data,
      };

      const socket = Globals.agentSockets.get(agent_id);
      if (socket) {
        socket.emit('CREATE_HONEYTOKEN_TEXT', token_data, async (response: any) => {
          if (response.status === 'created') {
            res.status(200).json({ success: true });
            return;
          }
        });
      } else {
        console.error(Constants.TEXT_RED_COLOR, 'Failed fetching socket to create honeytoken!');
        res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to create honeytoken text:', error);
      res.status(500).json({ success: false });
      return;
    }
  });

  router.post('/honeytokens/api', async (req, res) => {
    try {
      const { type, grade, expiration_date, notes, agent_id, api_port, apis } = req.body;

      const required = {
        type,
        grade,
        expiration_date,
        notes,
        agent_id,
        api_port,
      };

      const apis_test: any[] = apis;

      for (const [field, value] of Object.entries(required)) {
        if (value === undefined || value === null || value === '') {
          console.log(`Missing required field: ${field}`);
          return void res.status(500).json({ success: false });
        }
      }

      const group_id = uuidv4();

      apis_test.forEach(async (api) => {
        const token_id = uuidv4();

        await insert_honeytoken(
          agent_id,
          token_id,
          group_id,
          type,
          '',
          '',
          api.method,
          api.route,
          grade,
          new Date(),
          expiration_date,
          notes,
          api.response,
          '',
          api_port,
          '1', // TODO: change to the current user_id that is logged in
        );
      });

      const token_data = {
        group_id: group_id,
        type: type,
        grade: grade,
        expiration_date: expiration_date,
        api_port: api_port,
        apis: apis_test,
      };

      const socket = Globals.agentSockets.get(agent_id);
      if (socket) {
        socket.emit('CREATE_HONEYTOKEN_API', token_data, async (response: any) => {
          console.log(response.status);
          if (response.status === 'created') return void res.status(200).json({ success: true });
          else return void res.status(500).json({ success: false });
        });
      } else {
        console.error(Constants.TEXT_RED_COLOR, 'Failed fetching socket to create honeytoken!');
        return void res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to create honeytoken text:', error);
      return void res.status(500).json({ success: false });
    }
  });

  router.get('/honeytokens/token/:token_id', async (req, res) => {
    const { token_id } = req.params;
    try {
      const honeytoken = await get_honeytoken_by_token_id(token_id);
      res.json(honeytoken);
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to fetch honeytoken by token_id:',
        error,
        Constants.TEXT_WHITE_COLOR,
      );
      res.status(500).json({ failure: error });
    }
  });

  router.get('/honeytokens/type/:type_id', async (req, res) => {
    const { type_id } = req.params;
    try {
      const honeytokens = await get_honeytokens_by_type_id(type_id);
      res.json(honeytokens);
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to fetch honeytokens by type_id:',
        error,
        Constants.TEXT_WHITE_COLOR,
      );
      res.status(500).json({ failure: error });
    }
  });

  router.get('/honeytokens/group/:group_id', async (req, res) => {
    const { group_id } = req.params;
    try {
      const honeytokens = await get_honeytokens_by_group_id(group_id);
      res.json(honeytokens);
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to fetch honeytokens by group_id:',
        error,
        Constants.TEXT_WHITE_COLOR,
      );
      res.status(500).json({ failure: error });
    }
  });

  router.delete('/honeytokens/token/:token_id', async (req, res) => {
    try {
      const { token_id } = req.params;
      const token = await get_honeytoken_by_token_id(token_id);
      if (token == undefined) return void res.status(500).json({ success: false });

      const socket = Globals.agentSockets.get(token.agent_id);
      if (socket) {
        socket.emit('DELETE_HONEYTOKEN_TEXT', token_id, async (response: any) => {
          if (response.status === 'deleted') {
            await delete_honeytoken_by_id(token_id);
            return void res.status(200).json({ success: true });
          }
        });
      }
      return void res.status(500).json({ success: false });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to erase agent:', error, Constants.TEXT_WHITE_COLOR);
      return void res.status(500).json({ success: false });
    }
  });

  router.delete('/honeytokens/type/:type_id', async (req, res) => {
    const { type_id } = req.params;
    try {
      await delete_honeytokens_by_type_id(type_id);
      res.json({ success: true });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to delete honeytokens:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  router.delete('/honeytokens/group/:group_id', async (req, res) => {
    const { group_id } = req.params;

    try {
      const tokens = await get_honeytokens_by_group_id(group_id);
      const header = tokens[0];

      const socket = Globals.agentSockets.get(header.agent_id);

      if (socket) {
        socket.emit('DELETE_HONEYTOKEN_API', group_id);
      }

      console.log('delete: ', group_id);

      await delete_honeytokens_by_group_id(group_id);

      res.json({ success: `Deleted API tokens in group_id ${group_id}` });
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to delete honeytokens in group:',
        error,
        Constants.TEXT_WHITE_COLOR,
      );
      res.status(500).json({ failure: error });
    }
  });

  router.put('/honeytokens/monitor_status', async (req, res) => {
    try {
      const { token_id } = req.body;
      const token = await get_honeytoken_by_token_id(token_id);
      const agent = await get_agent_by_id(token.agent_id);

      if (token == undefined || agent == undefined) return void res.status(500).json({ success: false });

      const socket = Globals.agentSockets.get(token.agent_id);
      if (socket) {
        socket.emit('STATUS_HONEYTOKEN_TEXT', token_id, async (response: any) => {
          if (response.status === 'monitoring') return void res.status(200).json({ success: true });
          else return void res.status(500).json({ success: false });
        });
      } else {
        console.error(Constants.TEXT_RED_COLOR, 'failed getting socket for honeytoken text status!');
        return void res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to get honeytoken text status:',
        error,
        Constants.TEXT_WHITE_COLOR,
      );
      return void res.status(500).json({ success: false });
    }
  });

  router.post('/honeytokens/monitor_status_text', async (req, res) => {
    try {
      const { agents_ids } = req.body;
      let statuses: Record<string, boolean> = {};
      for (const agent_id of agents_ids) {
        const socket = Globals.agentSockets.get(agent_id);
        if (socket) {
          const response = await socket.emitWithAck('STATUSES_HONEYTOKENS_TEXT');
          if (response.success === true) {
            const agentTokensStatuses: Record<string, boolean> = response.message;
            statuses = { ...statuses, ...agentTokensStatuses };
          }
        }
      }
      return void res.status(200).json(statuses);
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to get honeytokens text statuses:',
        error,
        Constants.TEXT_WHITE_COLOR,
      );
      return void res.status(500).json({ success: false });
    }
  });

  router.post('/honeytokens/monitor_status_api', async (req, res) => {
    try {
      const { agents_ids } = req.body;
      let statuses: Record<string, boolean> = {};
      for (const agent_id of agents_ids) {
        const socket = Globals.agentSockets.get(agent_id);
        if (socket) {
          const response = await socket.emitWithAck('STATUSES_HONEYTOKENS_API');
          if (response.success === true) {
            const agentTokensStatuses: Record<string, boolean> = response.message;
            statuses = { ...statuses, ...agentTokensStatuses };
          }
        }
      }
      return void res.status(200).json(statuses);
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to get honeytokens text statuses:',
        error,
        Constants.TEXT_WHITE_COLOR,
      );
      return void res.status(500).json({ success: false });
    }
  });

  router.put('/honeytokens/start', async (req, res) => {
    try {
      const { token_id } = req.body;
      const token = await get_honeytoken_by_token_id(token_id);
      const socket = Globals.agentSockets.get(token.agent_id);
      if (socket) {
        socket.emit('START_HONEYTOKEN_TEXT', token_id, async (response: any) => {
          if (response.status === 'monitoring') return void res.status(200).json({ success: true });
          else return void res.status(500).json({ success: false });
        });
      } else {
        console.error(Constants.TEXT_RED_COLOR, 'failed getting socket for honeytoken text status!');
        return void res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to start monitor on honeytoken text:',
        error,
        Constants.TEXT_WHITE_COLOR,
      );
      return void res.status(500).json({ success: false });
    }
  });

  router.put('/honeytokens/api/start', async (req, res) => {
    const { group_id } = req.body;

    try {
      const tokens = await get_honeytokens_by_group_id(group_id);

      if (tokens.length === 0) {
        res.status(404).json({ failure: 'No API tokens found for this group_id' });
        return;
      }

      const token = tokens[0];
      const socket = Globals.agentSockets.get(token.agent_id);

      if (socket) {
        socket.emit('START_HONEYTOKEN_API', group_id);
        res.status(200).json({ success: 'success' });
      } else {
        res.status(500).json({ success: 'failure' });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to start monitor on group:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  router.put('/honeytokens/stop', async (req, res) => {
    try {
      const { token_id } = req.body;
      const token = await get_honeytoken_by_token_id(token_id);
      const socket = Globals.agentSockets.get(token.agent_id);
      if (socket) {
        socket.emit('STOP_HONEYTOKEN_TEXT', token_id, async (response: any) => {
          if (response.status === 'not monitoring') return void res.status(200).json({ success: true });
        });
      }
      console.error(Constants.TEXT_RED_COLOR, 'failed getting socket for honeytoken text status!');
      return void res.status(500).json({ success: false });
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to stop monitor on honeytoken text:',
        error,
        Constants.TEXT_WHITE_COLOR,
      );
      return void res.status(500).json({ success: false });
    }
  });

  router.put('/honeytokens/stop/group', async (req, res) => {
    const { group_id } = req.body;

    try {
      const tokens = await get_honeytokens_by_group_id(group_id);

      if (tokens.length === 0) {
        res.status(404).json({ failure: 'No API tokens found for this group_id' });
        return;
      }

      const token = tokens[0];
      const socket = Globals.agentSockets.get(token.agent_id);

      if (socket) {
        socket.emit('STOP_HONEYTOKEN_API', group_id);
        res.status(200).json({ success: 'success' });
      } else {
        res.status(500).json({ success: 'failure' });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to start monitor on group:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  Globals.app.use('/api', router);
}
