const sql = (strings: TemplateStringsArray, ...values: any[]) => String.raw(strings, ...values);
import { begin_transaction, commit, rollback } from './helpers';
import { Globals } from '../globals';

//INIT
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

//TEXT
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

//API
export async function is_user_honeytoken_group_exists(user_id: string, group_id: string) {
  return Globals.app.locals.db.get(
    sql`
      SELECT
        h.group_id
      FROM
        honeytokens AS h
        JOIN agents AS a ON h.agent_id = a.agent_id
      WHERE
        h.group_id = ?
        AND a.user_id = ?
    `,
    [group_id, user_id],
  );
}

//ALL
export async function get_all_user_honeytokens(user_id: string) {
  return Globals.app.locals.db.all(
    sql`
      SELECT
        h.*
      FROM
        honeytokens AS h
        JOIN agents AS a ON h.agent_id = a.agent_id
      WHERE
        a.user_id = ?;
    `,
    [user_id],
  );
}

//ALL
export async function get_all_agent_honeytokens(agent_id: string) {
  return await Globals.app.locals.db.all(
    sql`
      SELECT
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
      FROM
        honeytokens
      WHERE
        agent_id = ?;
    `,
    [agent_id],
  );
}

//TEXT
export async function get_honeytoken_by_token_id(token_id: string) {
  return Globals.app.locals.db.get(
    sql`
      SELECT
        *
      FROM
        honeytokens
      WHERE
        token_id = ?;
    `,
    [token_id],
  );
}

//API
export async function get_honeytokens_by_group_id(group_id: string) {
  return Globals.app.locals.db.all(
    sql`
      SELECT
        *
      FROM
        honeytokens
      WHERE
        group_id = ?;
    `,
    [group_id],
  );
}

//ALL
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

//TEXT
export async function delete_honeytoken_by_token_id(token_id: string) {
  try {
    await begin_transaction();

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM alerts
        WHERE
          token_id = ?;
      `,
      [token_id],
    );

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM honeytokens
        WHERE
          agent_id = ?
          AND token_id = ?;
      `,
      [token_id],
    );

    await commit();
    return true;
  } catch (err) {
    await rollback();
    return false;
  }
}

//API
export async function delete_honeytokens_by_group_id(group_id: string) {
  try {
    await begin_transaction();

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM alerts
        WHERE
          token_id = ?;
      `,
      [group_id],
    );

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM honeytokens
        WHERE
          group_id = ?;
      `,
      [group_id],
    );

    await commit();
    return true;
  } catch (err) {
    await rollback();
    return false;
  }
}

//ALL
export async function insert_honeytoken(
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
  return await Globals.app.locals.db.run(
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
