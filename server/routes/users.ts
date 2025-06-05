import { Router } from 'express';
import { add_user, check_user_credentials } from '../database/users';
import { Globals } from '../globals';

/* -----------------------------------------------------------
   1.  Dynamically load Biscuit — values at runtime,
       types via `import type` so TS is happy.
----------------------------------------------------------- */
import type {
  Biscuit as BiscuitT,
  BiscuitBuilder as BiscuitBuilderT,
  AuthorizerBuilder as AuthorizerBuilderT,
  Fact as FactT,
  Check as CheckT,
  PrivateKey as PrivateKeyT,
  KeyPair as KeyPairT,
  SignatureAlgorithm as SignatureAlgorithmT,
} from '@biscuit-auth/biscuit-wasm';

let Biscuit: typeof BiscuitT;
let BiscuitBuilder: typeof BiscuitBuilderT;
let AuthorizerBuilder: typeof AuthorizerBuilderT;
let Fact: typeof FactT;
let Check: typeof CheckT;
let PrivateKey: typeof PrivateKeyT;
let KeyPair: typeof KeyPairT;
let SignatureAlgorithm: typeof SignatureAlgorithmT;

async function loadBiscuit() {
  if (Biscuit) return; // already loaded
  const wasm = await import('@biscuit-auth/biscuit-wasm');
  ({ Biscuit, BiscuitBuilder, AuthorizerBuilder, Fact, Check, PrivateKey, KeyPair, SignatureAlgorithm } = wasm);
}

/* -----------------------------------------------------------
   2.  Root key: generate once, keep in .env
----------------------------------------------------------- */

const TOKEN_EXP_SECS = 2 * 60 * 60;

/* -----------------------------------------------------------
   3.  Token helpers (called after loadBiscuit)
----------------------------------------------------------- */
function issueToken(id: string, username: string): string {
  /* -------------------------------------------------
     1.  Build a fresh BiscuitBuilder from scratch
  ------------------------------------------------- */
  const bb = new BiscuitBuilder();
  const exp = Math.floor(Date.now() / 1000) + TOKEN_EXP_SECS;

  bb.addFact(Fact.fromString(`user("${id}")`));
  bb.addFact(Fact.fromString(`username("${username}")`));
  bb.addFact(Fact.fromString(`expiration(${exp})`));

  /* -------------------------------------------------
     2.  Sign with your (now-valid) Ed25519 private key
  ------------------------------------------------- */
  const bytes = Uint8Array.from(Buffer.from('9009afe0a2047edaee54e520047884cf19fe821e1f2390983dcc1e0f71924de5', 'hex'));
  const privateKey = PrivateKey.fromBytes(bytes, SignatureAlgorithm.Ed25519);

  console.log('public →', KeyPair.fromPrivateKey(privateKey).getPublicKey().toString());

  const token = bb.build(privateKey);

  //  OPTIONAL: log once, then remove for production
  console.log('🔑  new token →', token.toBase64());

  return token.toBase64();
}

function verifyToken(raw: string): BiscuitT {
  const bytes = Uint8Array.from(Buffer.from('9009afe0a2047edaee54e520047884cf19fe821e1f2390983dcc1e0f71924de5', 'hex'));
  const privateKey = PrivateKey.fromBytes(bytes, SignatureAlgorithm.Ed25519);

  console.log('public →', KeyPair.fromPrivateKey(privateKey).getPublicKey().toString());

  const tok = Biscuit.fromBase64(raw, KeyPair.fromPrivateKey(privateKey).getPublicKey());

  const ab = new AuthorizerBuilder();
  const now = Math.floor(Date.now() / 1000);
  ab.addFact(Fact.fromString(`now(${now})`));
  ab.addCheck(Check.fromString('check if expiration($e), now($n), $e > $n'));
  ab.addPolicy(Check.fromString('allow if true'));

  ab.buildAuthenticated(tok).authorize();
  return tok;
}

// utils/asyncHandler.ts
export const asyncHandler = (fn: (...a: any[]) => Promise<any>) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* -----------------------------------------------------------
   4.  Exported route factory
----------------------------------------------------------- */
await loadBiscuit(); // ensure wasm is ready
export function serveUsers() {
  const router = Router();

  /* -------- POST /signup ---------- */
  router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
      await add_user(username, password);
      return void res.status(201).json('success');
    } catch (e: any) {
      if (e.message?.includes('UNIQUE')) return void res.status(409).json('exists');
      return void res.status(201).json('failure');
    }
  });

  /* -------- POST /login ----------- */
  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      const { username, password } = req.body;
      const user = await check_user_credentials(username, password);
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      console.log('start from here!');
      const token = issueToken(user.id, user.username);
      console.log(token);
      res.json({ token });
    }),
  );

  /* -------- GET /me --------------- */
  router.get('/me', (req, res) => {
    const raw = req.headers.authorization?.split(' ')[1];
    if (!raw) return void res.status(401);

    try {
      const tok = verifyToken(raw);
      const block = tok.getBlockSource(0);

      const id = block.match(/user\("(.+?)"\)/)?.[1];
      const uname = block.match(/username\("(.+?)"\)/)?.[1];
      if (!id || !uname) throw new Error('facts missing');

      res.json({ id, username: uname });
    } catch {
      res.status(401);
    }
  });

  Globals.app.use('/api', router);
}
