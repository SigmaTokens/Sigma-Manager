import { Router } from 'express';
import { add_user, check_user_credentials } from '../database/users';
import { Globals } from '../globals';

/* -----------------------------------------------------------
   1.  Dynamically load Biscuit — values at runtime,
       types via `import type` so TS is happy.
----------------------------------------------------------- */
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

async function loadBiscuit() {
  if (Biscuit) return; // already loaded
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

/* -----------------------------------------------------------
   2.  Root key: generate once, keep in .env
----------------------------------------------------------- */

const TOKEN_EXP_SECS = 2 * 60 * 60;

/**
 * issueToken + a third-party signature
 * -----------------------------------
 * @param id        user id
 * @param username  display name
 * @returns         base-64 Biscuit token
 */
export function issueToken(id: string, username: string): string {
  /* 1 - Build the authority block */
  const bb = new BiscuitBuilder();
  const exp = Math.floor(Date.now() / 1000) + TOKEN_EXP_SECS;

  bb.addFact(Fact.fromString(`user("${id}")`));
  bb.addFact(Fact.fromString(`username("${username}")`));
  bb.addFact(Fact.fromString(`expiration(${exp})`));

  /* 2 - Sign with the *root* key */
  const rootBytes = Uint8Array.from(Buffer.from(process.env.PRIVATE_KEY_BISCUIT!, 'hex'));
  const rootKey = PrivateKey.fromBytes(rootBytes, SignatureAlgorithm.Ed25519);

  const token = bb.build(rootKey);

  /* 3 --- Add a *third-party* block and sign it                *
   *      (this is what Biscuit calls “adding a signer”)        */
  const signerBytes = Uint8Array.from(Buffer.from(process.env.PRIVATE_KEY_BISCUIT!, 'hex'));
  const signerKey = PrivateKey.fromBytes(signerBytes, SignatureAlgorithm.Ed25519);
  const signerPub = KeyPair.fromPrivateKey(signerKey).getPublicKey();

  // 3.a The root issuer creates a request for a third-party signature
  const request = token.getThirdPartyRequest();

  // 3.b The third party builds a block that **restricts** the token
  const bb3 = new BlockBuilder();
  bb3.addCheck(Check.fromString('check if operation("read")')); // example restriction

  // 3.c The third party converts the request + block into a signed block
  const thirdPartyBlock = request.createBlock(signerKey, bb3);

  // 3.d Attach the signed block back to the token
  const finalTok = token.appendThirdPartyBlock(signerPub, thirdPartyBlock);

  /* ─── 4 ▸ return the final, multi-signed token ────────── */
  return finalTok.toBase64();
}

function verifyToken(raw: string) {
  /* 1 ▸ load the *public* root key (hex in .env) */
  const rootBytes = Uint8Array.from(Buffer.from(process.env.PRIVATE_KEY_BISCUIT!, 'hex'));
  const rootKey = PrivateKey.fromBytes(rootBytes, SignatureAlgorithm.Ed25519);
  const rootPub = KeyPair.fromPrivateKey(rootKey).getPublicKey();

  /* 2 ▸ parse + cryptographically verify all signatures */
  const tok = Biscuit.fromBase64(raw, rootPub);

  /* 3 ▸ build the authorizer with runtime facts & checks */
  const ab = new AuthorizerBuilder();
  const now = Math.floor(Date.now() / 1000);

  ab.addFact(Fact.fromString(`now(${now})`));
  ab.addCheck(Check.fromString('check if expiration($e), now($n), $e > $n'));

  /* 3.a add a *default allow policy* so harmless tokens succeed */
  ab.addPolicy(Policy.fromString('allow if true')); // ← real policy, not check

  /* 4 ▸ run authorization (throws on failure) */
  ab.buildAuthenticated(tok).authorize();

  return tok; // safe to use, fully verified & authorized
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
