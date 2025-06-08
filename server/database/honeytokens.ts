const sql = (strings: TemplateStringsArray, ...values: any[]) => String.raw(strings, ...values);
import { begin_transaction, commit, rollback } from './helpers';
import { Globals } from '../globals';

export async function init_honeytokens_table() {
  await Globals.app.locals.db.exec(sql`
    CREATE TABLE IF NOT EXISTS honeytokens (
      token_id VARCHAR PRIMARY KEY,
      group_id VARCHAR,
      type_id INTEGER,
      grade INTEGER,
      creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      expire_date DATETIME,
      location VARCHAR,
      file_name VARCHAR,
      http_method VARCHAR,
      route VARCHAR,
      data TEXT,
      response TEXT,
      notes TEXT,
      agent_id VARCHAR,
      api_port INTEGER,
      FOREIGN KEY (type_id) REFERENCES types (type_id) ON DELETE CASCADE,
      FOREIGN KEY (agent_id) REFERENCES agents (agent_id) ON DELETE SET NULL,
    );
  `);
}

export async function is_user_honeytoken_exists(user_id: string, token_id: string) {
  return Globals.app.locals.db.get(
    sql`
      SELECT
        h.token_id
      FROM
        honeytokens AS h
        JOIN agents AS a ON h.agent_id = a.agent_id
      WHERE
        h.token_id = ?
        AND a.user_id = ?
    `,
    [token_id, user_id],
  );
}

export async function get_all_agent_honeytokens(agent_id: string) {
  return Globals.app.locals.db.all(
    sql`
      SELECT
        *
      FROM
        honeytokens
      WHERE
        agent_id = ?;
    `,
    [agent_id],
  );
}

export async function get_agent_honeytoken_by_token_id(agent_id: string, token_id: string) {
  return Globals.app.locals.db.get(
    sql`
      SELECT
        *
      FROM
        honeytokens
      WHERE
        agent_id = ?
        AND token_id = ?;
    `,
    [agent_id, token_id],
  );
}

export async function get_agent_honeytokens_by_type_id(agent_id: string, type_id: string) {
  return Globals.app.locals.db.all(
    sql`
      SELECT
        token_id,
        group_id,
        agent_id,
        type_id,
        grade,
        creation_date,
        expire_date,
        location,
        file_name,
        http_method,
        route,
        notes,
        response,
        data,
        api_port,
        user_id
      FROM
        honeytokens
      WHERE
        agent_id = ?
        AND type_id = ?;
    `,
    [agent_id, type_id],
  );
}

export async function get_agent_honeytokens_by_group_id(agent_id: string, group_id: string) {
  return Globals.app.locals.db.all(
    sql`
      SELECT
        *
      FROM
        honeytokens
      WHERE
        agent_id = ?
        AND group_id = ?;
    `,
    [agent_id, group_id],
  );
}

export async function delete_all_agent_honeytokens(agent_id: string) {
  return Globals.app.locals.db.run(
    sql`
      DELETE FROM honeytokens
      WHERE
        agent_id = ?;
    `,
    [agent_id],
  );
}

export async function delete_agent_honeytoken_by_id(agent_id: string, token_id: string) {
  try {
    await begin_transaction();

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM alerts
        WHERE
          agent_id = ?
          AND token_id = ?;
      `,
      [agent_id, token_id],
    );

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM honeytokens
        WHERE
          agent_id = ?
          AND token_id = ?;
      `,
      [agent_id, token_id],
    );

    await commit();
  } catch (err) {
    await rollback();
    throw err;
  }
}

export async function delete_agent_honeytokens_by_type_id(agent_id: string, type_id: string) {
  try {
    await begin_transaction();

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM alerts
        WHERE
          agent_id = ?
          AND type_id = ?;
      `,
      [agent_id, type_id],
    );

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM honeytokens
        WHERE
          agent_id = ?
          AND type_id = ?;
      `,
      [agent_id, type_id],
    );

    await commit();
  } catch (err) {
    await rollback();
    throw err;
  }
}

export async function delete_agent_honeytokens_by_group_id(agent_id: string, group_id: string) {
  try {
    await begin_transaction();

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM alerts
        WHERE
          agent_id = ?
          AND token_id = ?;
      `,
      [agent_id, group_id],
    );

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM honeytokens
        WHERE
          agent_id = ?
          AND group_id = ?;
      `,
      [agent_id, group_id],
    );

    await commit();
  } catch (err) {
    await rollback();
    throw err;
  }
}

export async function insert_agent_honeytoken(
  agent_id: string,
  token_id: string,
  group_id: string,
  type_id: number,
  file_name: string,
  location: string,
  http_method: string,
  route: string,
  grade: number,
  creation_date: Date,
  expiration_date: Date,
  notes: string,
  response: string,
  data: string,
  api_port: number,
) {
  await Globals.app.locals.db.run(
    sql`
      INSERT INTO
        honeytokens (
          agent_id,
          token_id,
          group_id,
          type_id,
          grade,
          creation_date,
          expire_date,
          location,
          file_name,
          http_method,
          route,
          data,
          response,
          notes,
          api_port
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      agent_id,
      token_id,
      group_id,
      type_id,
      grade,
      creation_date,
      expiration_date,
      location,
      file_name,
      http_method,
      route,
      data,
      response,
      notes,
      api_port,
    ],
  );
}
