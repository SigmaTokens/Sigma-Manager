import { Router } from 'express';
import { auth } from '../middleware/auth';
import { Globals } from '../globals';
import { getAgents, getHoneytokens } from '../utilities/utils';
import { EventEmitter } from 'events';

const agentsEvents = new EventEmitter();
const honeytokenEvents = new EventEmitter();
export const sseUpdateAgents = () => agentsEvents.emit('update');
export const sseUpdateHoneytokens = () => honeytokenEvents.emit('update');

export function serveSSE() {
  const router = Router();

  router.use(auth());

  router.get('/agents_sse', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const user_id: string = (req as any).user.id;

    const pushUpdate = async () => {
      const agents = await getAgents(user_id);
      res.write(`data: ${JSON.stringify(agents)}\n\n`);
    };

    await pushUpdate();

    agentsEvents.on('update', pushUpdate);

    req.on('close', () => {
      agentsEvents.off('update', pushUpdate);
      res.end();
    });
  });

  router.get('/honeytokens_sse', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const user_id: string = (req as any).user.id;

    const pushUpdate = async () => {
      console.log('pushing honeytokens !');
      const honeytokens = await getHoneytokens(user_id);
      res.write(`data: ${JSON.stringify(honeytokens)}\n\n`);
    };

    await pushUpdate();

    honeytokenEvents.on('update', pushUpdate);

    req.on('close', () => {
      honeytokenEvents.off('update', pushUpdate);
      res.end();
    });
  });

  Globals.app.use('/api', router);
}
