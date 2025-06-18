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
import { sseUpdateHoneytokens } from './sse';

export function serveHoneytokens() {
  const router = Router();

  router.use(auth());

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
        if (value === undefined || value === null || value === '') return void res.status(500).json({ success: false });
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

      sseUpdateHoneytokens();

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

      const socket = Globals.agentSockets.get(agent_id);
      if (socket)
        socket.emit('CREATE_HONEYTOKEN_TEXT', token_data, async (response: any) => {
          if (response.status === 'created') {
          } else {
          }
        });
      else {
        console.error(
          Constants.TEXT_RED_COLOR,
          'Failed fetching socket to create honeytoken!',
          Constants.TEXT_DEFAULT_COLOR,
        );
      }
      return void res.status(200).json({ success: true });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to create honeytoken text:', error, Constants.TEXT_DEFAULT_COLOR);
      return void res.status(500).json({ success: false });
    }
  });

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
        if (value === undefined || value === null || value === '') return void res.status(500).json({ success: false });
      }

      const isOwner = await is_user_agent(user_id, agent_id);

      if (!isOwner) return void res.status(500).json({ success: false });

      const api_honeytokens = await get_all_user_honeytokens(user_id);

      const exists = api_honeytokens.find((token: any) => token.api_port === api_port && token.agent_id === agent_id);

      if (exists) return void res.status(500).json({ success: false });

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

        if (!result) {
          return void res.status(500).json({ success: false });
        }
      });

      sseUpdateHoneytokens();

      const token_data = {
        group_id: group_id,
        type: type,
        grade: grade,
        expiration_date: expiration_date,
        api_port: api_port,
        apis: apis_test,
      };

      const socket = Globals.agentSockets.get(agent_id);
      if (socket)
        socket.emit('CREATE_HONEYTOKEN_API', token_data, async (response: any) => {
          if (response.status === 'created') {
            return void res.status(200).json({ success: true });
          }
          return void res.status(500).json({ success: false });
        });
      else {
        console.error(
          Constants.TEXT_RED_COLOR,
          'Failed fetching socket to create honeytoken!',
          Constants.TEXT_DEFAULT_COLOR,
        );
        return void res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to create honeytoken api:', error, Constants.TEXT_DEFAULT_COLOR);
      return void res.status(500).json({ success: false });
    }
  });

  router.delete('/honeytokens/token/:token_id', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { token_id } = req.params;
      const isOwner = await is_user_honeytoken_exists(user_id, token_id);

      if (!isOwner) return void res.status(500).json({ success: false });

      const token = await get_honeytoken_by_token_id(token_id);
      if (!token) return void res.status(500).json({ success: false });

      const socket = Globals.agentSockets.get(token.agent_id);
      if (socket)
        socket.emit('DELETE_HONEYTOKEN_TEXT', token_id, async (response: any) => {
          if (response.status === 'deleted') {
          } else {
          }
        });
      const isDeleted = await delete_honeytoken_by_token_id(token_id);
      if (isDeleted) {
        sseUpdateHoneytokens();
        return void res.status(200).json({ success: true });
      } else return void res.status(500).json({ success: false });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to delete honeytoken text:', error, Constants.TEXT_DEFAULT_COLOR);
      return void res.status(500).json({ success: false });
    }
  });

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
      if (socket) {
        socket.emit('DELETE_HONEYTOKEN_API', group_id, async (response: any) => {
          isDeleted = await delete_honeytokens_by_group_id(group_id);
          if (isDeleted) {
            sseUpdateHoneytokens();
            return void res.status(200).json({ success: true });
          } else return void res.status(500).json({ success: false });
        });
      } else {
        isDeleted = await delete_honeytokens_by_group_id(group_id);
        sseUpdateHoneytokens();
        return void res.status(200).json({ success: true });
      }
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

  router.put('/honeytokens/start', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { token_id } = req.body;

      const isOwner = is_user_honeytoken_exists(user_id, token_id);
      if (!isOwner) return void res.status(500).json({ success: false });

      const token = await get_honeytoken_by_token_id(token_id);

      if (!token) return void res.status(500).json({ success: false });

      const socket = Globals.agentSockets.get(token.agent_id);
      if (socket)
        socket.emit('START_HONEYTOKEN_TEXT', token_id, async (response: any) => {
          if (response.status === 'monitoring') {
            sseUpdateHoneytokens();
            return void res.status(200).json({ success: true });
          } else return void res.status(500).json({ success: false });
        });
      else {
        console.error(
          Constants.TEXT_RED_COLOR,
          'failed getting socket for honeytoken text start!',
          Constants.TEXT_DEFAULT_COLOR,
        );
        return void res.status(500).json({ success: false });
      }
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

      const socket = Globals.agentSockets.get(token.agent_id);
      if (socket) {
        socket.emit('START_HONEYTOKEN_API', group_id);
        sseUpdateHoneytokens();
        return void res.status(200).json({ success: true });
      } else {
        console.error(Constants.TEXT_RED_COLOR, 'failed getting socket for honeytoken text start!');
        return void res.status(500).json({ success: false });
      }
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to start monitor on group:', error, Constants.TEXT_DEFAULT_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  router.put('/honeytokens/stop', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { token_id } = req.body;

      const isOwner = await is_user_honeytoken_exists(user_id, token_id);

      if (!isOwner) return void res.status(500).json({ success: false });

      const token = await get_honeytoken_by_token_id(token_id);

      if (!token) return void res.status(500).json({ success: false });
      const socket = Globals.agentSockets.get(token.agent_id);
      if (socket)
        socket.emit('STOP_HONEYTOKEN_TEXT', token_id, async (response: any) => {
          if (response.status === 'not monitoring') {
            sseUpdateHoneytokens();
            return void res.status(200).json({ success: true });
          } else return void res.status(500).json({ success: false });
        });
      else {
        console.error(
          Constants.TEXT_RED_COLOR,
          'failed getting socket for honeytoken text stop!',
          Constants.TEXT_DEFAULT_COLOR,
        );
        return void res.status(500).json({ success: false });
      }
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
      if (socket) {
        socket.emit('STOP_HONEYTOKEN_API', group_id);
        sseUpdateHoneytokens();
        return void res.status(200).json({ success: true });
      } else {
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
