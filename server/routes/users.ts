import { Router } from 'express';
import { add_user, check_user_credentials } from '../database/users';
import { Globals } from '../globals';
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
  try {
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
  } catch {
    return '';
  }
}

export function verifyToken(raw: string) {
  try {
    // 1 - load the *public* root key (hex in .env)
    const rootBytes = Uint8Array.from(Buffer.from(process.env.PRIVATE_KEY_BISCUIT!, 'hex'));
    const rootKey = PrivateKey.fromBytes(rootBytes, SignatureAlgorithm.Ed25519);
    const rootPub = KeyPair.fromPrivateKey(rootKey).getPublicKey();

    // 2 - parse + cryptographically verify all signatures
    const tok = Biscuit.fromBase64(raw, rootPub);

    // 3 - build authorizer
    const ab = new AuthorizerBuilder();
    const now = Math.floor(Date.now() / 1000);
    ab.addFact(Fact.fromString(`now(${now})`));
    ab.addFact(Fact.fromString('operation("all")'));
    ab.addCheck(Check.fromString('check if expiration($e), now($n), $e > $n'));
    ab.addPolicy(Policy.fromString('allow if true'));

    // 4 - run authorization (may throw)
    const auth = ab.buildAuthenticated(tok);
    auth.authorize();

    return tok;
  } catch {
    return '';
  }
}

export function serveUsers() {
  const router = Router();

  /* -------- POST /signup ---------- */
  router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
      await add_user(username, password);
      return void res.status(200).json('success');
    } catch (e: any) {
      if (e.message?.includes('UNIQUE')) return void res.status(500).json('exists');
      return void res.status(500).json('failure');
    }
  });

  /* -------- POST /login ----------- */
  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      const { username, password } = req.body;
      const user = await check_user_credentials(username, password);
      if (!user) return void res.status(500).json({ message: 'Invalid credentials' });
      const token = issueToken(user.id, user.username);

      if (token === '') return void res.status(500).json({ message: 'Broken token!' });

      return void res.status(200).json({ token });
    }),
  );

  /* -------- GET /me --------------- */
  router.get('/me', (req, res) => {
    const raw = req.headers.authorization?.split(' ')[1];
    if (!raw) return void res.status(500).json({ message: 'Broken token!' });

    try {
      const tok = verifyToken(raw);

      if (tok === '') return void res.status(500).json({ message: 'Broken tok!' });

      const block = tok.getBlockSource(0);

      const id = block.match(/user\("(.+?)"\)/)?.[1];
      const uname = block.match(/username\("(.+?)"\)/)?.[1];
      if (!id || !uname) throw new Error('facts missing');

      return void res.status(200).json({ id, username: uname });
    } catch {
      return void res.status(500).json({ message: 'Broken token!' });
    }
  });

  Globals.app.use('/api', router);
}
