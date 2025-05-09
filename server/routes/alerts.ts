import { Router, Express } from 'express';
import {
  create_alert_to_token_id,
  get_all_alerts_join,
  get_alert_by_alert_id,
  get_alert_by_token_id,
  delete_alert_by_alert_id,
  set_archive_by_alert_id,
} from '../database/alerts';
import { Globals } from '../globals';
import { Constants } from '../constants';

export function serveAlerts() {
  const router = Router();

  router.post('/alerts', async (req, res) => {
    try {
      const { token_id, alert_epoch, accessed_by, log } = req.body;
      const result = await create_alert_to_token_id(token_id, alert_epoch, accessed_by, log);

      res.json({ success: result });
    } catch (error: any) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to create alert:', error.message, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error.message });
    }
  });

  router.get('/alerts', async (req, res) => {
    try {
      const alerts = await get_all_alerts_join();
      res.json(alerts);
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to fetch alerts:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  router.get('/alerts/:alert_id', async (req, res) => {
    const { alert_id } = req.params;
    try {
      const alert = await get_alert_by_alert_id(alert_id);
      res.json(alert);
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to fetch alert:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  router.get('/alerts/token/:token_id', async (req, res) => {
    const { token_id } = req.params;
    try {
      const alert = await get_alert_by_token_id(token_id);
      res.json(alert);
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to fetch alert:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  router.delete('/alerts/:alert_id', async (req, res) => {
    try {
      const { alert_id } = req.params;
      await delete_alert_by_alert_id(alert_id);
      res.json({ success: true });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to delete alert:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  router.post('/alerts/archive/:alert_id', async (req, res) => {
    try {
      const { alert_id } = req.params;
      const { archive } = req.body;
      await set_archive_by_alert_id(alert_id, archive);
      res.json({ success: true });
    } catch (error) {
      console.error(Constants.TEXT_RED_COLOR, 'Failed to set archive status:', error, Constants.TEXT_WHITE_COLOR);
      res.status(500).json({ failure: error });
    }
  });

  Globals.app.use('/api', router);
}
