import { Router } from 'express';
import { Globals } from '../globals';
import { getLocalIPv4s } from '../utils';

export function serveGeneral() {
  const router = Router();

  router.get('/server', async (req, res) => {
    res.status(200).json({
      port: Globals.server.address().port,
    });
  });

  router.get('/ips', async (req, res) => {
    res.status(200).json({ ips: getLocalIPv4s() });
  });
  Globals.app.use('/api', router);
}
