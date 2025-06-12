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

await loadBiscuit();

export async function issueBiscuit(id: string, username: string): string {
  try {
    await loadBiscuit();

    // 1 - Build the authority block
    const bb = new BiscuitBuilder();
    const TOKEN_EXP_SECS = 2 * 600 * 600;
    const exp = Math.floor(Date.now() / 1000) + TOKEN_EXP_SECS;

    bb.addFact(Fact.fromString(`user("${id}")`));
    bb.addFact(Fact.fromString(`username("${username}")`));
    bb.addFact(Fact.fromString(`expiration(${exp})`));

    // 2 - Sign with the *root* key
    const rootBytes = Uint8Array.from(Buffer.from(process.env.PRIVATE_KEY_BISCUIT!, 'hex'));
    const rootKey = PrivateKey.fromBytes(rootBytes, SignatureAlgorithm.Ed25519);

    const biscuit = bb.build(rootKey);

    // 3 - Add a *third-party* block and sign it
    const signerBytes = Uint8Array.from(Buffer.from(process.env.PRIVATE_KEY_BISCUIT!, 'hex'));
    const signerKey = PrivateKey.fromBytes(signerBytes, SignatureAlgorithm.Ed25519);
    const signerPub = KeyPair.fromPrivateKey(signerKey).getPublicKey();
    const request = biscuit.getThirdPartyRequest();

    const bb3 = new BlockBuilder();
    bb3.addCheck(Check.fromString('check if operation("all")'));

    const thirdPartyBlock = request.createBlock(signerKey, bb3);

    const finalTok = biscuit.appendThirdPartyBlock(signerPub, thirdPartyBlock);

    // 4 - return the final, multi-signed biscuit
    return finalTok.toBase64();
  } catch {
    console.log('wtf?SD?ASD?AS?D');
    return '';
  }
}

export async function verifyBiscuit(raw: string) {
  try {
    await loadBiscuit();

    // 1 - load the *public* root key (hex in .env)
    const rootBytes = Uint8Array.from(Buffer.from(process.env.PRIVATE_KEY_BISCUIT!, 'hex'));
    const rootKey = PrivateKey.fromBytes(rootBytes, SignatureAlgorithm.Ed25519);
    const rootPub = KeyPair.fromPrivateKey(rootKey).getPublicKey();
    console.log('1');
    // 2 - parse + cryptographically verify all signatures
    const tok = Biscuit.fromBase64(raw, rootPub);
    console.log('2');
    // 3 - build authorizer
    const ab = new AuthorizerBuilder();
    const now = Math.floor(Date.now() / 1000);
    ab.addFact(Fact.fromString(`now(${now})`));
    ab.addFact(Fact.fromString('operation("all")'));
    ab.addCheck(Check.fromString('check if expiration($e), now($n), $e > $n'));
    ab.addPolicy(Policy.fromString('allow if true'));
    console.log('3');
    // 4 - run authorization (may throw)
    const auth = ab.buildAuthenticated(tok);
    auth.authorize();
    console.log('4');
    return tok;
  } catch {
    console.log('end');
    return '';
  }
}
