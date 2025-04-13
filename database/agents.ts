import { Database } from 'sqlite'
import sqlite3 from 'sqlite3'

export async function init_agents_table(
  database: Database<sqlite3.Database, sqlite3.Statement>,
) {
  await database.run(`
    CREATE TABLE IF NOT EXISTS agents (
      agent_id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_name TEXT NOT NULL,
      agent_ip TEXT NOT NULL
    );
  `)
}
