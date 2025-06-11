import { Request, Response, NextFunction, RequestHandler } from 'express';
import { loadBiscuit, verifyToken } from '../routes/users';

export function auth(mustBeSelf = false): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await loadBiscuit();

      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) return void res.status(500).json({ message: 'No token' });

      const raw = authHeader.split(' ')[1];

      const tok = verifyToken(raw);
      if (tok === '') return void res.status(500).json({ message: 'Broken tok!' });

      const block0 = tok?.getBlockSource(0);

      const id = block0?.match(/user\("(.+?)"\)/)?.[1];
      const username = block0?.match(/username\("(.+?)"\)/)?.[1];

      if (!id || !username) return void res.status(500).json({ message: 'Bad facts' });

      if (mustBeSelf) {
        const paramUserId = req.params.userId;
        if (paramUserId && paramUserId !== id) return void res.status(500).json({ message: 'Forbidden' });
      }

      (req as any).user = { id, username };

      next();
    } catch {
      return void res.status(500).json({ message: 'Invalid or expired token' });
    }
  };
}
