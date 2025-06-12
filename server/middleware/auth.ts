import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyBiscuit } from '../utilities/biscuit';
import { Constants } from '../constants';

export function auth(mustBeSelf = false): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let raw = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : undefined;

      if (!raw && (req as any).cookies?.biscuit) raw = (req as any).cookies.biscuit;

      if (!raw) {
        console.log('here4');
        return void res.status(500).json({ action: Constants.ACCESS_DENIED, force: false });
      }

      const tok = verifyBiscuit(raw);

      if (tok === '') {
        console.log('here3');
        return void res.status(500).json({ action: Constants.ACCESS_DENIED, force: true });
      }

      const block0 = tok?.getBlockSource(0);

      const id = block0?.match(/user\("(.+?)"\)/)?.[1];
      const username = block0?.match(/username\("(.+?)"\)/)?.[1];

      if (!id || !username) {
        console.log('here2');
        return void res.status(500).json({ action: Constants.ACCESS_DENIED, force: true });
      }

      if (mustBeSelf) {
        const paramUserId = req.params.userId;
        if (paramUserId && paramUserId !== id) {
          console.log('here1');
          return void res.status(500).json({ action: Constants.ACCESS_DENIED, force: true });
        }
      }

      console.log('ok!', id, username);
      (req as any).user = { id, username };

      next();
    } catch {
      return void res.status(500).json({ action: Constants.ACCESS_DENIED, force: true });
    }
  };
}
