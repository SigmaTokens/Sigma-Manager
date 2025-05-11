import { Globals } from '../globals';
import { sql } from './agents'; // reuse sql tag

export async function init_users_table() {
  const db = Globals.app.locals.db;

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );
  `);
}
