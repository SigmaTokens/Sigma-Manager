import { Router } from 'express';
import {
  insert_honeytoken,
  is_user_honeytoken_exists,
  is_user_honeytoken_group_exists,
  get_honeytoken_by_token_id,
  get_all_user_honeytokens,
  get_honeytokens_by_group_id,
  delete_honeytoken_by_token_id,
  delete_honeytokens_by_group_id,
} from '../database/honeytokens';
import { Globals } from '../globals';
import { is_user_agent } from '../database/agents';
import { v4 as uuidv4 } from 'uuid';
import { Constants } from '../constants';
import { auth } from '../middleware/auth';

export function serveHoneytokens() {
  const router = Router();

  router.use(auth());

  //✔️
  router.get('/honeytokens', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const honeytokens: any = await get_all_user_honeytokens(user_id);

      if (honeytokens) return void res.status(200).json(honeytokens);
      return void res.status(200).json([]);
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to fetch honeytokens:', error, Constants.TEXT_DEFAULT_COLOR);
      return void res.status(500).json([]);
    }
  });
  //✔️
  router.post('/honeytokens/text', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
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
          return void res.status(500).json({ success: false });
        }
      }

      const isOwner = await is_user_agent(user_id, agent_id);

      if (!isOwner) return void res.status(500).json({ success: false });

      const token_id = uuidv4();
      const group_id = uuidv4();

      const result = await insert_honeytoken(
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
      );

      if (!result) return void res.status(500).json({ success: false });

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

      let isCreated = false;

      const socket = Globals.agentSockets.get(agent_id);
      if (socket)
        socket.emit('CREATE_HONEYTOKEN_TEXT', token_data, async (response: any) => {
          if (response.status === 'created') isCreated = true;
        });
      else {
        console.error(Constants.TEXT_RED_COLOR, 'Failed fetching socket to create honeytoken!');
        return void res.status(500).json({ success: false });
      }
      if (!isCreated) return void res.status(500).json({ success: false });
      return void res.status(200).json({ success: true });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to create honeytoken text:', error);
      return void res.status(500).json({ success: false });
    }
  });
  //✔️
  router.post('/honeytokens/api', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
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

      const isOwner = await is_user_agent(user_id, agent_id);

      if (!isOwner) return void res.status(500).json({ success: false });

      const group_id = uuidv4();

      apis_test.forEach(async (api) => {
        const token_id = uuidv4();

        const result = await insert_honeytoken(
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
        );

        if (!result) return void res.status(500).json({ success: false });
      });

      const token_data = {
        group_id: group_id,
        type: type,
        grade: grade,
        expiration_date: expiration_date,
        api_port: api_port,
        apis: apis_test,
      };

      let isCreated = false;

      const socket = Globals.agentSockets.get(agent_id);
      if (socket)
        socket.emit('CREATE_HONEYTOKEN_API', token_data, async (response: any) => {
          console.log(response.status);
          if (response.status === 'created') isCreated = true;
        });
      else {
        console.error(Constants.TEXT_RED_COLOR, 'Failed fetching socket to create honeytoken!');
        return void res.status(500).json({ success: false });
      }
      if (!isCreated) return void res.status(500).json({ success: false });
      return void res.status(200).json({ success: true });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to create honeytoken api:', error);
      return void res.status(500).json({ success: false });
    }
  });
  //✔️
  router.delete('/honeytokens/token/:token_id', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { token_id } = req.params;
      const isOwner = await is_user_honeytoken_exists(user_id, token_id);

      if (!isOwner) return void res.status(500).json({ success: false });

      const token = await get_honeytoken_by_token_id(token_id);
      if (!token) return void res.status(500).json({ success: false });

      let isDeleted = false;

      const socket = Globals.agentSockets.get(token.agent_id);
      if (socket)
        socket.emit('DELETE_HONEYTOKEN_TEXT', token_id, async (response: any) => {
          if (response.status === 'deleted') isDeleted = await delete_honeytoken_by_token_id(token_id);
        });

      if (isDeleted) return void res.status(200).json({ success: true });
      return void res.status(500).json({ success: false });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to delete honeytoken text:', error, Constants.TEXT_DEFAULT_COLOR);
      return void res.status(500).json({ success: false });
    }
  });
  //✔️
  router.delete('/honeytokens/group/:group_id', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { group_id } = req.params;

      const isOwner = await is_user_honeytoken_group_exists(user_id, group_id);

      if (!isOwner) return void res.status(500).json({ success: false });

      const tokens = await get_honeytokens_by_group_id(group_id);

      if (!tokens || tokens.length === 0) return void res.status(500).json({ success: false });

      const header = tokens[0];

      let isDeleted = false;

      const socket = Globals.agentSockets.get(header.agent_id);
      if (socket)
        socket.emit('DELETE_HONEYTOKEN_API', group_id, async (response: any) => {
          isDeleted = await delete_honeytokens_by_group_id(group_id);
          if (isDeleted) return void res.status(200).json({ success: true });
          else return void res.status(500).json({ success: false });
        });
      else return void res.status(500).json({ success: false });
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to delete honeytokens in group:',
        error,
        Constants.TEXT_DEFAULT_COLOR,
      );
      return void res.status(500).json({ success: false });
    }
  });
  //✔️
  router.post('/honeytokens/monitor_status_text', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { agents_ids } = req.body;
      let statuses: Record<string, boolean> = {};
      for (const agent_id of agents_ids) {
        const isOwner = await is_user_agent(user_id, agent_id);
        if (isOwner) {
          const socket = Globals.agentSockets.get(agent_id);
          if (socket) {
            const response = await socket.emitWithAck('STATUSES_HONEYTOKENS_TEXT');
            if (response.success === true) {
              const agentTokensStatuses: Record<string, boolean> = response.message;
              statuses = { ...statuses, ...agentTokensStatuses };
            }
          }
        }
      }

      return void res.status(200).json(statuses);
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to get honeytokens text statuses:',
        error,
        Constants.TEXT_DEFAULT_COLOR,
      );
      return void res.status(500).json({});
    }
  });
  //✔️
  router.post('/honeytokens/monitor_status_api', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { agents_ids } = req.body;
      let statuses: Record<string, boolean> = {};
      for (const agent_id of agents_ids) {
        const isOwner = await is_user_agent(user_id, agent_id);
        if (isOwner) {
          const socket = Globals.agentSockets.get(agent_id);
          if (socket) {
            const response = await socket.emitWithAck('STATUSES_HONEYTOKENS_API');
            if (response.success === true) {
              const agentTokensStatuses: Record<string, boolean> = response.message;
              statuses = { ...statuses, ...agentTokensStatuses };
            }
          }
        }
      }
      return void res.status(200).json(statuses);
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to get honeytokens api statuses:',
        error,
        Constants.TEXT_DEFAULT_COLOR,
      );
      return void res.status(500).json({ success: false });
    }
  });
  //✔️
  router.put('/honeytokens/start', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { token_id } = req.body;

      const isOwner = is_user_honeytoken_exists(user_id, token_id);
      if (!isOwner) return void res.status(500).json({ success: false });

      const token = await get_honeytoken_by_token_id(token_id);

      if (!token) return void res.status(500).json({ success: false });

      let isMonitoring = false;

      const socket = Globals.agentSockets.get(token.agent_id);
      if (socket)
        socket.emit('START_HONEYTOKEN_TEXT', token_id, async (response: any) => {
          if (response.status === 'monitoring') isMonitoring = true;
        });
      else {
        console.error(Constants.TEXT_RED_COLOR, 'failed getting socket for honeytoken text start!');
        return void res.status(500).json({ success: false });
      }

      if (!isMonitoring) return void res.status(500).json({ success: false });
      return void res.status(200).json({ success: true });
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to start monitor on honeytoken text:',
        error,
        Constants.TEXT_DEFAULT_COLOR,
      );
      return void res.status(500).json({ success: false });
    }
  });
  //✔️
  router.put('/honeytokens/api/start', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { group_id } = req.body;
      const isOwner = await is_user_honeytoken_group_exists(user_id, group_id);

      if (!isOwner) return void res.status(500).json({ success: false });

      const tokens = await get_honeytokens_by_group_id(group_id);

      if (!tokens || tokens.length === 0) return void res.status(500).json({ success: false });

      const token = tokens[0];

      let isMonitoring = false;

      const socket = Globals.agentSockets.get(token.agent_id);
      if (socket)
        socket.emit('START_HONEYTOKEN_API', group_id, async (response: any) => {
          isMonitoring = true;
        });
      else {
        console.error(Constants.TEXT_RED_COLOR, 'failed getting socket for honeytoken text start!');
        return void res.status(500).json({ success: false });
      }
      if (!isMonitoring) return void res.status(500).json({ success: false });
      return void res.status(200).json({ success: true });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to start monitor on group:', error, Constants.TEXT_DEFAULT_COLOR);
      res.status(500).json({ failure: error });
    }
  });
  //✔️
  router.put('/honeytokens/stop', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { token_id } = req.body;

      const isOwner = await is_user_honeytoken_exists(user_id, token_id);

      if (!isOwner) return void res.status(500).json({ success: false });

      const token = await get_honeytoken_by_token_id(token_id);

      if (!token) return void res.status(500).json({ success: false });

      let isMonitoring = true;

      const socket = Globals.agentSockets.get(token.agent_id);
      if (socket)
        socket.emit('STOP_HONEYTOKEN_TEXT', token_id, async (response: any) => {
          if (response.status === 'not monitoring') isMonitoring = false;
        });
      else {
        console.error(Constants.TEXT_RED_COLOR, 'failed getting socket for honeytoken text stop!');
        return void res.status(500).json({ success: false });
      }
      if (isMonitoring) return void res.status(500).json({ success: false });
      return void res.status(200).json({ success: true });
    } catch (error) {
      console.error(
        Constants.TEXT_RED_COLOR,
        'Failed to stop monitor on honeytoken text:',
        error,
        Constants.TEXT_DEFAULT_COLOR,
      );
      return void res.status(500).json({ success: false });
    }
  });
  //✔️
  router.put('/honeytokens/stop/group', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { group_id } = req.body;

      const isOwner = await is_user_honeytoken_group_exists(user_id, group_id);

      if (!isOwner) return void res.status(500).json({ success: false });

      const tokens = await get_honeytokens_by_group_id(group_id);

      if (!tokens || tokens.length === 0) return void res.status(500).json({ success: false });

      const token = tokens[0];

      const socket = Globals.agentSockets.get(token.agent_id);
      if (socket)
        socket.emit('STOP_HONEYTOKEN_API', group_id, async (response: any) => {
          return void res.status(200).json({ success: true });
        });
      else {
        console.error(Constants.TEXT_RED_COLOR, 'failed getting socket for honeytoken text stop!');
        return void res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to start monitor on group:', error, Constants.TEXT_DEFAULT_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  Globals.app.use('/api', router);
}
