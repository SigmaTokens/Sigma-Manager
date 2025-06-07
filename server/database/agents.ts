const sql = (strings: TemplateStringsArray, ...values: any[]) => String.raw(strings, ...values);
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
      user_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users (user_id)
    );
  `);
}

export async function insert_user_agent(agent_id: string, ip: string, name: string, port: number, user_id: string) {
  await Globals.app.locals.db.run(
    sql`
      INSERT INTO
        agents (
          agent_id,
          agent_ip,
          agent_name,
          agent_port,
          user_id
        )
      VALUES
        (?, ?, ?, ?, ?)
    `,
    [agent_id, ip, name, port, user_id],
  );
}

export async function update_user_agent(agent_id: string, ip: string, name: string, port: number, user_id: string) {
  await Globals.app.locals.db.run(
    sql`
      UPDATE agents
      SET
        agent_ip = ?,
        agent_name = ?,
        agent_port = ?,
        user_id = ? -- keep / re-assign ownership
      WHERE
        agent_id = ?
        AND user_id = ?
    `,
    [ip, name, port, user_id, agent_id, user_id],
  );
}

export async function verify_user_agent_by_id(agent_id: string, user_id: string) {
  await Globals.app.locals.db.run(
    sql`
      UPDATE agents
      SET
        validated = 1
      WHERE
        agent_id = ?
        AND user_id = ?
    `,
    [agent_id, user_id],
  );
}

export async function get_all_user_agents(user_id: string) {
  const rows = await Globals.app.locals.db.all(sql`
    SELECT
      a.agent_id,
      a.agent_name,
      a.agent_ip,
      a.agent_port,
      a.validated,
      a.user_id,
      u.username
    FROM
      agents a
      LEFT JOIN users u ON a.user_id = u.user_id
    WHERE
      a.user_id = ${user_id};
  `);

  return rows;
}

export async function get_user_agent_by_id(agent_id: string, user_id: string) {
  return Globals.app.locals.db.get(
    sql`
      SELECT
        agent_id,
        agent_name,
        agent_ip,
        agent_port,
        validated,
        user_id
      FROM
        agents
      WHERE
        agent_id = ?
        AND user_id = ?
    `,
    [agent_id, user_id],
  );
}

export async function get_user_agent_by_uri(agent_ip: string, agent_port: number, user_id: string) {
  return Globals.app.locals.db.get(
    sql`
      SELECT
        agent_id,
        agent_name,
        agent_ip,
        agent_port,
        validated,
        user_id
      FROM
        agents
      WHERE
        agent_ip = ?
        AND agent_port = ?
        AND user_id = ?
    `,
    [agent_ip, agent_port, user_id],
  );
}

export async function delete_user_agent_by_id(agent_id: string, user_id: string) {
  try {
    await begin_transaction();

    // TODO: delete associated alerts and tokens here, filtered by agent_id&&user_id

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM agents
        WHERE
          agent_id = ?
          AND user_id = ?
      `,
      [agent_id, user_id],
    );

    await commit();
  } catch (error) {
    await rollback();
    throw error;
  }
}
