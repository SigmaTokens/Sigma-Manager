import { Request, Response, NextFunction, RequestHandler } from 'express';
import { loadBiscuit, verifyToken } from '../routes/users';

export function auth(mustBeSelf = false): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await loadBiscuit();

      let raw = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : undefined;

      if (!raw && (req as any).cookies?.token) {
        raw = (req as any).cookies.token;
      }

      if (!raw) {
        return void res.status(401).json({ message: 'No token provided' });
      }

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
