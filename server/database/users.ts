import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';
import { Globals } from '../globals';

const sql = (strings: TemplateStringsArray, ...vals: any[]) => String.raw(strings, ...vals);

/* ------------------------------------------------------------------
   1.  Table definition (TEXT UUID PK)
-------------------------------------------------------------------*/
export async function init_users_table() {
  await Globals.app.locals.db.exec(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);
}

/* ------------------------------------------------------------------
   2.  Public helpers
-------------------------------------------------------------------*/
export async function get_all_users() {
  return Globals.app.locals.db.all(sql`
    SELECT
      id,
      username
    FROM
      users;
  `);
}

/**
 * Hash + insert a new user   (Argon2id)
 */
export async function add_user(username: string, rawPassword: string) {
  const id = uuidv4();

  const hash = await argon2.hash(rawPassword, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MiB
    timeCost: 3, // iterations
    parallelism: 1,
    // salt is generated automatically
  });

  await Globals.app.locals.db.run(
    sql`
      INSERT INTO
        users (id, username, password)
      VALUES
        (?, ?, ?);
    `,
    [id, username, hash],
  );
}

/**
 * Look up a user and verify the supplied password against the Argon2-id hash
 * stored in the DB.
 *
 * @returns `{ id, username }` on success, otherwise `null`.
 */
export async function check_user_credentials(
  username: string,
  rawPassword: string,
): Promise<{ id: string; username: string } | null> {
  /* 1. fetch row (id + password hash) */
  const row = (await Globals.app.locals.db.get(
    sql`
      SELECT
        id,
        password
      FROM
        users
      WHERE
        username = ?;
    `,
    [username],
  )) as { id: string; password: string } | undefined;

  /* 2. if user not found → do a dummy verify to equalise timing */
  if (!row) {
    await argon2.verify(
      '$argon2id$v=19$m=65536,t=3,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      rawPassword,
    );
    return null;
  }

  /* 3. verify supplied password against stored Argon2-id hash */
  const ok = await argon2.verify(row.password, rawPassword);

  return ok ? { id: row.id, username } : null;
}
