import { Database } from "sqlite";
import sqlite3 from "sqlite3";

export async function init_whitelist_table(
  database: Database<sqlite3.Database, sqlite3.Statement>
) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS whitelist (
      token_id VARCHAR,
      access_ip VARCHAR,
      user VARCHAR,
      PRIMARY KEY (token_id, access_ip),
      FOREIGN KEY (token_id) REFERENCES honeytokens(token_id)
    );
  `);
}
