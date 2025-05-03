import { Router } from 'express';
import { Globals } from '../globals';

export function serveGeneral() {
  const router = Router();

  router.get('/server', async (req, res) => {
    const ip = require('ip');
    res.status(200).json({
      ip: ip.address(),
      port: Globals.server.address().port,
    });
  });

  Globals.app.use('/api', router);
}
