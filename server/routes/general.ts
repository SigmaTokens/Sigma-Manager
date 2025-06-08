import { Router } from 'express';
import { Globals } from '../globals';
import { getLocalIPv4s } from '../utilities/utils';

export function serveGeneral() {
  const router = Router();

  //✔️
  router.post('/server', async (req, res) => {
    const { address } = req.body;
    return void res.status(200).json({
      ip: address,
      port: Globals.server.address().port,
    });
  });
  //✔️
  router.get('/ips', async (req, res) => {
    return void res.status(200).json({ ips: getLocalIPv4s() });
  });
  Globals.app.use('/api', router);
}
