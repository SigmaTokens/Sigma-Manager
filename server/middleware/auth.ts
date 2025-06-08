// middleware/auth.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { loadBiscuit, verifyToken } from '../routes/users';

/**
 * auth()
 * ------
 * @param mustBeSelf  pass `true` to forbid acting on other users
 *
 * Adds `req.user = { id: string, username: string }`
 */
export function auth(mustBeSelf = false): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log('[AUTH] 🔐 Starting authentication middleware');
    try {
      await loadBiscuit();
      console.log('[AUTH] ✅ Biscuit WASM loaded');

      const authHeader = req.headers.authorization;
      console.log('[AUTH] ⏎ Authorization header:', authHeader);

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('[AUTH] ❌ No valid authorization header provided');
        res.status(401).json({ message: 'No token' });
        return;
      }

      const raw = authHeader.split(' ')[1];
      console.log('[AUTH] 📦 Extracted token:', raw.slice(0, 10) + '...');

      const tok = verifyToken(raw);
      console.log('[AUTH] ✅ Biscuit token verified');

      const block0 = tok.getBlockSource(0);
      console.log('[AUTH] 🧱 Block0 content:', block0);

      const id = block0.match(/user\("(.+?)"\)/)?.[1];
      const username = block0.match(/username\("(.+?)"\)/)?.[1];
      console.log('[AUTH] 👤 Extracted user:', { id, username });

      if (!id || !username) {
        console.warn('[AUTH] ❌ Missing user facts in token');
        throw new Error('bad facts');
      }

      if (mustBeSelf) {
        console.log('[AUTH] 🔒 Self-check enabled');
        const paramUserId = req.params.userId;
        console.log('[AUTH] ⛔ Checking req.params.userId:', paramUserId);

        if (paramUserId && paramUserId !== id) {
          console.warn(`[AUTH] ❌ Forbidden access attempt: token id = ${id}, param id = ${paramUserId}`);
          res.status(403).json({ message: 'Forbidden' });
          return;
        }
      }

      (req as any).user = { id, username };
      console.log('[AUTH] ✅ Authentication passed — user injected into request');

      next();
    } catch (e: any) {
      console.error('[AUTH] ❌ Invalid or expired biscuit:', e?.message || e);
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}
