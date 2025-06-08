import { Router } from 'express';
import { create_token_alert, get_all_token_alerts, set_token_alert_archive_by_alert_id } from '../database/alerts';
import { Globals } from '../globals';
import { Constants } from '../constants';
import { auth } from '../middleware/auth';
import { get_all_user_agents } from '../database/agents';
import { get_all_agent_honeytokens } from '../database/honeytokens';

export function serveAlerts() {
  const router = Router();

  router.use(auth());
  //❌
  router.post('/alerts/create', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { token_id, alert_epoch, accessed_by, log } = req.body;

      const agents = await get_all_user_agents(user_id);
      if (!agents.length) return void res.status(500).json({ success: false });

      let tokenFound = false;

      await Promise.all(
        agents.map(async (agent: any) => {
          if (tokenFound) return;

          const tokens = await get_all_agent_honeytokens(agent.agent_id);
          if (tokens.some((t: any) => t.token_id === token_id)) {
            tokenFound = true;
          }
        }),
      );

      if (!tokenFound) return void res.status(500).json({ success: false });

      const result = await create_token_alert(token_id, alert_epoch, accessed_by, log);

      if (!result) return void res.status(500).json({ success: false });

      return void res.status(200).json({ success: true });
    } catch (error: any) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to create alert:', error.message, Constants.TEXT_WHITE_COLOR);
      return void res.status(500).json({ success: false });
    }
  });
  //✔️
  router.get('/alerts', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;

      const agents = await get_all_user_agents(user_id);
      if (!agents.length) return void res.status(200).json([]);

      const alertsNested = await Promise.all(
        agents.map(async (agent: any) => {
          const tokens = await get_all_agent_honeytokens(agent.agent_id);

          if (!tokens.length) return [];

          const tokenAlerts = await Promise.all(tokens.map((t: any) => get_all_token_alerts(t.token_id)));

          return tokenAlerts.flat();
        }),
      );

      const alerts = alertsNested.flat();

      if (!alerts) return void res.status(200).json([]);
      return void res.status(200).json(alerts);
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to fetch alerts:', error, Constants.TEXT_WHITE_COLOR);
      return void res.status(500).json([]);
    }
  });
  //✔️
  router.post('/alerts/archive', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { token_id, alert_id, archive } = req.body;

      const agents = await get_all_user_agents(user_id);
      if (!agents.length) return void res.status(500).json({ success: false });

      let tokenFound = false;

      await Promise.all(
        agents.map(async (agent: any) => {
          if (tokenFound) return;

          const tokens = await get_all_agent_honeytokens(agent.agent_id);
          if (tokens.some((t: any) => t.token_id === token_id)) {
            tokenFound = true;
          }
        }),
      );

      let result = false;

      if (tokenFound) result = await set_token_alert_archive_by_alert_id(token_id, alert_id, archive);

      if (!result) return void res.status(500).json({ success: false });

      return void res.status(200).json({ success: true });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to set archive status:', error, Constants.TEXT_WHITE_COLOR);
      return void res.status(500).json({ success: false });
    }
  });

  Globals.app.use('/api', router);
}
