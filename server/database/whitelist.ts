import { Globals } from '../globals';

export async function init_whitelist_table() {
  await Globals.app.locals.db.exec(`
    CREATE TABLE IF NOT EXISTS whitelist (
      token_id VARCHAR,
      access_ip VARCHAR,
      user VARCHAR,
      PRIMARY KEY (token_id, access_ip),
      FOREIGN KEY (token_id) REFERENCES honeytokens(token_id)
    );
  `);
}
