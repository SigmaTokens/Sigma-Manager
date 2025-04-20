import { Router, Express } from 'express';
import {
  create_alert_to_token_id,
  get_all_alerts_join,
  get_alert_by_alert_id,
  get_alert_by_token_id,
  delete_alert_by_alert_id,
} from '../database/alerts';
import { Globals } from '../globals';

export function serveAlerts() {
  const router = Router();

  router.post('/alerts', async (req, res) => {
    try {
      const { token_id, alert_epoch, accessed_by, log } = req.body;

      const result = await create_alert_to_token_id(
        token_id,
        alert_epoch,
        accessed_by,
        log,
      );

      res.json({ success: result });
    } catch (error: any) {
      console.error('[-] Failed to create alert:', error.message);
      res.status(500).json({ failure: error.message });
    }
  });

  router.get('/alerts', async (req, res) => {
    try {
      const alerts = await get_all_alerts_join();
      res.json(alerts);
    } catch (error) {
      console.error('[-] Failed to fetch alerts:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.get('/alerts/:alert_id', async (req, res) => {
    const { alert_id } = req.params;
    try {
      const alert = await get_alert_by_alert_id(alert_id);
      res.json(alert);
    } catch (error) {
      console.error('[-] Failed to fetch alert:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.get('/alerts/token/:token_id', async (req, res) => {
    const { token_id } = req.params;
    try {
      const alert = await get_alert_by_token_id(token_id);
      res.json(alert);
    } catch (error) {
      console.error('[-] Failed to fetch alert:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.delete('/alerts/:alert_id', async (req, res) => {
    try {
      const { alert_id } = req.params;
      await delete_alert_by_alert_id(alert_id);
      res.json({ success: true });
    } catch (error) {
      console.error('[-] Failed to delete alert:', error);
      res.status(500).json({ failure: error });
    }
  });

  Globals.app.use('/api', router);
}
