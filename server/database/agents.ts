const sql = (strings: TemplateStringsArray, ...values: any[]) =>
  String.raw(strings, ...values);
import { Globals } from '../globals';
import { begin_transaction, commit, rollback } from './helpers';

export async function init_agents_table() {
  await Globals.app.locals.db.run(sql`
    CREATE TABLE IF NOT EXISTS agents (
      agent_id VARCHAR PRIMARY KEY,
      agent_name TEXT NOT NULL,
      agent_ip TEXT NOT NULL,
      agent_port INTEGER NOT NULL,
      validated INTEGER DEFAULT 0,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
  `);
}

export async function insert_agent(
  agent_id: string,
  ip: string,
  name: string,
  port: number,
  user_id?: number, // make optional if not always known
) {
  await Globals.app.locals.db.run(
    sql`
      INSERT INTO
        agents (agent_id, agent_ip, agent_name, agent_port, user_id)
      VALUES
        (?, ?, ?, ?, ?)
    `,
    [agent_id, ip, name, port, user_id ?? null],
  );
}


export async function update_agent(
  agent_id: string,
  ip: string,
  name: string,
  port: number,
) {
  await Globals.app.locals.db.run(
    sql`
      UPDATE agents
      SET
        agent_ip = ?,
        agent_name = ?,
        agent_port = ?
      WHERE
        agent_id = ?
    `,
    [ip, name, port, agent_id],
  );
}

export async function verify_agent_by_id(agent_id: string) {
  await Globals.app.locals.db.run(
    sql`
      UPDATE agents
      SET
        validated = 1
      WHERE
        agent_id = ?
    `,
    [agent_id],
  );
}

export async function get_all_agents() {
  return await Globals.app.locals.db.all(sql`
    SELECT
      *
    FROM
      agents
  `);
}

export async function get_agent_by_id(agent_id: string) {
  return await Globals.app.locals.db.get(
    sql`
      SELECT
        agent_id,
        agent_name,
        agent_ip,
        agent_port,
        validated
      FROM
        agents
      WHERE
        agent_id = ?;
    `,
    [agent_id],
  );
}

export async function get_agent_by_uri(agent_ip: string, agent_port: number) {
  return await Globals.app.locals.db.get(
    sql`
      SELECT
        agent_id,
        agent_name,
        agent_ip,
        agent_port,
        validated
      FROM
        agents
      WHERE
        agent_ip = ?
        AND agent_port = ?
    `,
    [agent_ip, agent_port],
  );
}

export async function delete_agent_by_id(agent_id: string) {
  try {
    await begin_transaction();

    //TODO: delete associated alerts and tokens

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM agents
        WHERE
          agent_id = ?
      `,
      [agent_id],
    );

    await commit();
  } catch (error) {
    await rollback();
  }
}
