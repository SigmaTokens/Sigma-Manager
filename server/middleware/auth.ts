import { Request, Response, NextFunction, RequestHandler } from 'express';
import { loadBiscuit, verifyToken } from '../routes/users';

export function auth(mustBeSelf = false): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const denyAccess = 'DENY_ACCESS';
    try {
      await loadBiscuit();

      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) return void res.status(500).json({ action: denyAccess });

      const raw = authHeader.split(' ')[1];

      const tok = verifyToken(raw);
      if (tok === '') return void res.status(500).json({ action: denyAccess });

      const block0 = tok?.getBlockSource(0);

      const id = block0?.match(/user\("(.+?)"\)/)?.[1];
      const username = block0?.match(/username\("(.+?)"\)/)?.[1];

      if (!id || !username) return void res.status(500).json({ action: denyAccess });

      if (mustBeSelf) {
        const paramUserId = req.params.userId;
        if (paramUserId && paramUserId !== id) return void res.status(500).json({ action: denyAccess });
      }

      (req as any).user = { id, username };

      next();
    } catch {
      return void res.status(500).json({ action: denyAccess });
    }
  };
}
