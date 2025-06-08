const sql = (strings: TemplateStringsArray, ...values: any[]) => String.raw(strings, ...values);
import { Globals } from '../globals';
import { begin_transaction, commit, rollback } from './helpers';
export async function init_agents_table() {
  await Globals.app.locals.db.run(sql`
    CREATE TABLE IF NOT EXISTS agents (
      agent_id VARCHAR PRIMARY KEY,
      agent_name TEXT NOT NULL,
      validated INTEGER DEFAULT 0,
      user_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users (user_id)
    );
  `);
}

export async function insert_user_agent(agent_id: string, name: string, user_id: number) {
  await Globals.app.locals.db.run(
    sql`
      INSERT INTO
        agents (agent_id, agent_name, user_id)
      VALUES
        (?, ?, ?)
    `,
    [agent_id, name, user_id],
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

export async function delete_user_agent_by_id(agent_id: string, user_id: string): Promise<boolean> {
  try {
    await begin_transaction();

    //delete alerts of api honeytokens
    await Globals.app.locals.db.run(
      sql`
        DELETE FROM alerts
        WHERE
          token_id IN (
            SELECT
              h.group_id
            FROM
              honeytokens AS h
              JOIN agents a ON h.agent_id = a.agent_id
            WHERE
              h.agent_id = ?
              AND a.user_id = ?
          );
      `,
      [agent_id, user_id],
    );

    //delete alerts of text honeytokens
    await Globals.app.locals.db.run(
      sql`
        DELETE FROM alerts
        WHERE
          token_id IN (
            SELECT
              h.token_id
            FROM
              honeytokens AS h
              JOIN agents a ON h.agent_id = a.agent_id
            WHERE
              h.agent_id = ?
              AND a.user_id = ?
          );
      `,
      [agent_id, user_id],
    );

    //delete honeytokens
    await Globals.app.locals.db.run(
      sql`
        DELETE FROM honeytokens
        WHERE
          agent_id IN (
            SELECT
              agent_id
            FROM
              agents
            WHERE
              agent_id = ?
              AND user_id = ?
          );
      `,
      [agent_id, user_id],
    );

    //delete agent
    await Globals.app.locals.db.run(
      sql`
        DELETE FROM agents
        WHERE
          agent_id = ?
          AND user_id = ?;
      `,
      [agent_id, user_id],
    );

    await commit();
    return true;
  } catch (error) {
    await rollback();
    return false;
  }
}
