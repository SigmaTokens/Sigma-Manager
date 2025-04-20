import { Globals } from '../globals';
import { begin_transaction, commit, rollback } from './helpers';

export async function init_agents_table() {
  await Globals.app.locals.db.run(`
    CREATE TABLE IF NOT EXISTS agents (
      agent_id VARCHAR PRIMARY KEY,
      agent_name TEXT NOT NULL,
      agent_ip TEXT NOT NULL,
      agent_port INTEGER NOT NULL
    );
  `);
}

export async function insert_agent(
  agent_id: string,
  ip: string,
  name: string,
  port: number,
) {
  await Globals.app.locals.db.run(
    `INSERT INTO agents (agent_id, agent_ip, agent_name, agent_port) VALUES (?, ?, ?, ?)`,
    [agent_id, ip, name, port],
  );
}

export async function get_all_agents() {
  return await Globals.app.locals.db.all(`SELECT * FROM agents`);
}

export async function get_agent(agent_id: string) {
  return await Globals.app.locals.db.get(
    `
    SELECT  agent_id, 
                  agent_name, 
                  agent_ip, 
                  agent_port
      FROM  agents
    WHERE  agent_id = ?;`,
    [agent_id],
  );
}

export async function delete_agent_by_id(agent_id: String) {
  try {
    await begin_transaction();

    //TODO: delete associated alerts and tokens

    await Globals.app.locals.db.run(`DELETE FROM agents WHERE agent_id = ?`, [
      agent_id,
    ]);

    await commit();
  } catch (error) {
    await rollback();
  }
}
