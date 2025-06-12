import { Router } from 'express';
import { add_user, check_user_credentials } from '../database/users';
import { Globals } from '../globals';
import { issueBiscuit } from '../utilities/biscuit';

export const asyncHandler = (fn: (...a: any[]) => Promise<any>) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function serveUsers() {
  const router = Router();

  router.post(
    '/signup',
    asyncHandler(async (req, res) => {
      const { username, password } = req.body;
      try {
        await add_user(username, password);
        return void res.status(200).json('success');
      } catch (e: any) {
        if (e.message?.includes('UNIQUE')) return void res.status(500).json('exists');
        return void res.status(500).json('failure');
      }
    }),
  );

  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      const { username, password } = req.body;

      const user = await check_user_credentials(username, password);
      if (!user) return void res.status(500).json({ message: 'Invalid credentials' });
      const biscuit = issueBiscuit(user.id, user.username);

      if (biscuit === '') return void res.status(500).json({ message: 'Broken token!' });

      return void res.status(200).json({ biscuit });
    }),
  );

  Globals.app.use('/api', router);
}
