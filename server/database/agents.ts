import { Globals } from '../globals';

export async function init_agents_table() {
  await Globals.app.locals.db.run(`
    CREATE TABLE IF NOT EXISTS agents (
      agent_id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_name TEXT NOT NULL,
      agent_ip TEXT NOT NULL
    );
  `);
}
