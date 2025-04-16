import { Router, Express } from 'express';
import {
  create_alert_to_token_id,
  create_alerts_to_token_id,
  get_all_alerts,
  get_alert_by_alert_id,
  //get_alert_by_alert_grade,
  get_alert_by_token_id,
  delete_alert_by_alert_id,
} from '../../database/alerts';

export function serveAlerts(app: Express) {
  const router = Router();

  router.post('/alerts', async (req, res) => {
    try {
      const db = app.locals.db;
      const { token_id, alert_epoch, accessed_by, log } = req.body;

      const result = await create_alert_to_token_id(
        db,
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

  router.post('/alerts/bulk', async (req, res) => {
    try {
      const db = app.locals.db;
      const { alerts } = req.body;

      const result = await create_alerts_to_token_id(db, alerts);

      res.json({ success: result });
    } catch (error: any) {
      console.error('[-] Failed to create alerts:', error.message);
      res.status(500).json({ failure: error.message });
    }
  });

  router.get('/alerts', async (req, res) => {
    try {
      const db = app.locals.db;
      const alerts = await get_all_alerts(db);
      res.json(alerts);
    } catch (error) {
      console.error('[-] Failed to fetch alerts:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.get('/alerts/:alert_id', async (req, res) => {
    const { alert_id } = req.params;
    try {
      const db = app.locals.db;
      const alert = await get_alert_by_alert_id(db, alert_id);
      res.json(alert);
    } catch (error) {
      console.error('[-] Failed to fetch alert:', error);
      res.status(500).json({ failure: error });
    }
  });

  router.get('/alerts/token/:token_id', async (req, res) => {
    const { token_id } = req.params;
    try {
      const db = app.locals.db;
      const alert = await get_alert_by_token_id(db, token_id);
      res.json(alert);
    } catch (error) {
      console.error('[-] Failed to fetch alert:', error);
      res.status(500).json({ failure: error });
    }
  });

  // router.get("/alerts/grade/:alert_grade", async (req, res) => {
  // 	const { alert_grade } = req.params;
  // 	try {
  // 		const db = app.locals.db;
  // 		const alert = await get_alert_by_alert_grade(db, alert_grade);
  // 		res.json(alert);
  // 	} catch (error) {
  // 		console.error("[-] Failed to fetch alert:", error);
  // 		res.status(500).json({ failure: error });
  // 	}
  // });

  router.delete('/alerts/:alert_id', async (req, res) => {
    try {
      const db = app.locals.db;
      const { alert_id } = req.params;
      await delete_alert_by_alert_id(db, alert_id);
      res.json({ success: true });
    } catch (error) {
      console.error('[-] Failed to delete alert:', error);
      res.status(500).json({ failure: error });
    }
  });

  app.use('/api', router);
}
