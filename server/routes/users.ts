import { Router } from 'express';
import { add_user, check_user_credentials } from '../database/users';
import { Globals } from '../globals';
import util from 'util';
import type {
  Policy as PolicyT,
  Biscuit as BiscuitT,
  BiscuitBuilder as BiscuitBuilderT,
  BlockBuilder as BlockBuilderT,
  AuthorizerBuilder as AuthorizerBuilderT,
  Fact as FactT,
  Check as CheckT,
  PrivateKey as PrivateKeyT,
  KeyPair as KeyPairT,
  SignatureAlgorithm as SignatureAlgorithmT,
} from '@biscuit-auth/biscuit-wasm';

let Policy: typeof PolicyT;
let Biscuit: typeof BiscuitT;
let BiscuitBuilder: typeof BiscuitBuilderT;
let BlockBuilder!: typeof BlockBuilderT;
let AuthorizerBuilder: typeof AuthorizerBuilderT;
let Fact: typeof FactT;
let Check: typeof CheckT;
let PrivateKey: typeof PrivateKeyT;
let KeyPair: typeof KeyPairT;
let SignatureAlgorithm: typeof SignatureAlgorithmT;

export const asyncHandler = (fn: (...a: any[]) => Promise<any>) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export async function loadBiscuit() {
  if (Biscuit) return;
  const wasm = await import('@biscuit-auth/biscuit-wasm');
  ({
    Policy,
    Biscuit,
    BiscuitBuilder,
    AuthorizerBuilder,
    Fact,
    Check,
    PrivateKey,
    KeyPair,
    SignatureAlgorithm,
    BlockBuilder,
  } = wasm);
}

export function issueToken(id: string, username: string): string {
  // 1 - Build the authority block
  const bb = new BiscuitBuilder();
  const TOKEN_EXP_SECS = 2 * 60 * 60;
  const exp = Math.floor(Date.now() / 1000) + TOKEN_EXP_SECS;

  bb.addFact(Fact.fromString(`user("${id}")`));
  bb.addFact(Fact.fromString(`username("${username}")`));
  bb.addFact(Fact.fromString(`expiration(${exp})`));

  // 2 - Sign with the *root* key
  const rootBytes = Uint8Array.from(Buffer.from(process.env.PRIVATE_KEY_BISCUIT!, 'hex'));
  const rootKey = PrivateKey.fromBytes(rootBytes, SignatureAlgorithm.Ed25519);

  const token = bb.build(rootKey);

  // 3 - Add a *third-party* block and sign it
  const signerBytes = Uint8Array.from(Buffer.from(process.env.PRIVATE_KEY_BISCUIT!, 'hex'));
  const signerKey = PrivateKey.fromBytes(signerBytes, SignatureAlgorithm.Ed25519);
  const signerPub = KeyPair.fromPrivateKey(signerKey).getPublicKey();

  const request = token.getThirdPartyRequest();

  const bb3 = new BlockBuilder();
  bb3.addCheck(Check.fromString('check if operation("all")'));

  const thirdPartyBlock = request.createBlock(signerKey, bb3);

  const finalTok = token.appendThirdPartyBlock(signerPub, thirdPartyBlock);

  // 4 - return the final, multi-signed token
  return finalTok.toBase64();
}

export function verifyToken(raw: string) {
  try {
    /* 1 ▸ load the *public* root key (hex in .env) */
    const rootBytes = Uint8Array.from(Buffer.from(process.env.PRIVATE_KEY_BISCUIT!, 'hex'));
    const rootKey = PrivateKey.fromBytes(rootBytes, SignatureAlgorithm.Ed25519);
    const rootPub = KeyPair.fromPrivateKey(rootKey).getPublicKey();
    console.log('[BISCUIT] ✅ Loaded root public key');

    /* 2 ▸ parse + cryptographically verify all signatures */
    const tok = Biscuit.fromBase64(raw, rootPub);
    console.log('[BISCUIT] ✅ Token signature verified');
    console.log('[BISCUIT] 🧱 Authority block:\n' + tok.getBlockSource(0));
    console.log('[BISCUIT] 🧱 Authority block permissions:\n' + tok.getBlockSource(1));

    /* 3 ▸ build authorizer */
    const ab = new AuthorizerBuilder();
    const now = Math.floor(Date.now() / 1000);
    ab.addFact(Fact.fromString(`now(${now})`));
    ab.addFact(Fact.fromString('operation("all")')); // 👈 REQUIRED for the check
    ab.addCheck(Check.fromString('check if expiration($e), now($n), $e > $n'));
    ab.addPolicy(Policy.fromString('allow if true'));

    console.log('[BISCUIT] 🛠️  Authorizer setup:');
    console.log('- Fact: now(' + now + ')');
    console.log('- Check: expiration > now');

    /* 4 ▸ run authorization (may throw) */
    const auth = ab.buildAuthenticated(tok);
    auth.authorize(); // ← might throw
    console.log('[BISCUIT] ✅ Authorization passed');

    return tok;
  } catch (err: any) {
    console.error('[BISCUIT] ❌ Authorization failed:', err?.message || err);

    // 🌟 Add this to deeply inspect the error object
    console.error(
      '[BISCUIT] 🔎 Full error object (util.inspect):\n' + util.inspect(err, { depth: null, colors: true }),
    );
    console.dir(err, { depth: null }); // 👈 also logs expanded structure

    // 🍰 Biscuit-specific debug helpers
    if (err?.print) {
      console.error('[BISCUIT] ❗ Authorizer print:\n' + err.print());
    }
    if (err?.dump) {
      console.error('[BISCUIT] 📦 Dump:\n' + err.dump());
    }

    throw err;
  }
}

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
      const token = issueToken(user.id, user.username);
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
