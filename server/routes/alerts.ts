import { Router } from 'express';
import { get_all_user_alerts, set_honeytoken_alert_archive_by_alert_id } from '../database/alerts';
import { Globals } from '../globals';
import { Constants } from '../constants';
import { auth } from '../middleware/auth';
import { get_all_user_agents } from '../database/agents';
import { is_user_honeytoken_exists } from '../database/honeytokens';

export function serveAlerts() {
  const router = Router();

  router.use(auth());

  router.post('/alerts/archive', async (req, res) => {
    try {
      const user_id: string = (req as any).user.id;
      const { token_id, alert_id, archive } = req.body;

      const agents = await get_all_user_agents(user_id);
      if (!agents.length) return void res.status(500).json({ success: false });

      const isToken: any = is_user_honeytoken_exists(user_id, token_id);

      let result = false;

      if (isToken) result = await set_honeytoken_alert_archive_by_alert_id(token_id, alert_id, archive);

      if (!result) return void res.status(500).json({ success: false });

      return void res.status(200).json({ success: true });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to set archive status:', error, Constants.TEXT_DEFAULT_COLOR);
      return void res.status(500).json({ success: false });
    }
  });

  Globals.app.use('/api', router);
}
