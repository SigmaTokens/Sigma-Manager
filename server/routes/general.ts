import { Router } from 'express';
import { Globals } from '../globals';
import { getLocalIPv4s } from '../utils';
import { auth } from '../middleware/auth';

export function serveGeneral() {
  const router = Router();

  router.use(auth());

  router.post('/server', async (req, res) => {
    const { address } = req.body;
    res.status(200).json({
      ip: address,
      port: Globals.server.address().port,
    });
  });

  router.get('/ips', async (req, res) => {
    res.status(200).json({ ips: getLocalIPv4s() });
  });
  Globals.app.use('/api', router);
}
