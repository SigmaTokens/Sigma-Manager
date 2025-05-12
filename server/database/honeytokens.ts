const sql = (strings: TemplateStringsArray, ...values: any[]) =>
  String.raw(strings, ...values);
import { v4 as uuidv4 } from 'uuid';
import { get_all_types } from './types';
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
      data TEXT,
      notes TEXT,
      agent_id VARCHAR,
      user_id INTEGER,
      FOREIGN KEY (type_id) REFERENCES types (type_id) ON DELETE CASCADE,
      FOREIGN KEY (agent_id) REFERENCES agents (agent_id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL
    );
  `);
}


export async function get_all_honeytokens() {
  return await Globals.app.locals.db.all(sql`
    SELECT
      agent_id,
      token_id,
      group_id,
      type_id,
      grade,
      creation_date,
      expire_date,
      location,
      file_name,
      data,
      notes
    FROM
      honeytokens
  `);
}

export async function get_honeytoken_by_token_id(token_id: String) {
  return await Globals.app.locals.db.get(
    sql`
      SELECT
        token_id,
        agent_id,
        group_id,
        type_id,
        grade,
        creation_date,
        expire_date,
        location,
        file_name,
        data,
        notes
      FROM
        honeytokens
      WHERE
        token_id = ?;
    `,
    [token_id],
  );
}

export async function get_honeytokens_by_agent_id(agent_id: String) {
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
        data,
        notes
      FROM
        honeytokens
      WHERE
        agent_id = ?;
    `,
    [agent_id],
  );
}

export async function get_honeytokens_by_type_id(type_id: String) {
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
        data,
        notes
      FROM
        honeytokens
      WHERE
        type_id = ?;
    `,
    [type_id],
  );
}

export async function get_honeytokens_by_group_id(group_id: String) {
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
        notes,
        data
      FROM
        honeytokens
      WHERE
        group_id = ?;
    `,
    [group_id],
  );
}

export async function delete_all_honeytokens() {
  return await Globals.app.locals.db.run(sql`DELETE FROM honeytokens`);
}

export async function delete_honeytoken_by_id(token_id: String) {
  try {
    await begin_transaction();

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM alerts
        WHERE
          token_id = ?
      `,
      [token_id],
    );

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM honeytokens
        WHERE
          token_id = ?
      `,
      [token_id],
    );

    await commit();
  } catch (error) {
    await rollback();
  }
}

export async function delete_honeytokens_by_type_id(type_id: String) {
  try {
    await begin_transaction();

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM alerts
        WHERE
          type_id = ?
      `,
      [type_id],
    );

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM honeytokens
        WHERE
          type_id = ?
      `,
      [type_id],
    );

    await commit();
  } catch (error) {
    await rollback();
  }
}

export async function delete_honeytokens_by_group_id(group_id: String) {
  try {
    await begin_transaction();

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM alerts
        WHERE
          group_id = ?
      `,
      [group_id],
    );

    await Globals.app.locals.db.run(
      sql`
        DELETE FROM honeytokens
        WHERE
          group_id = ?
      `,
      [group_id],
    );

    await commit();
  } catch (error) {
    await rollback();
  }
}
export async function insert_honeytoken(
  agent_id: string,
  token_id: string,
  group_id: string,
  type_id: any,
  file_name: string,
  location: string,
  grade: number,
  creation_date: Date,
  expiration_date: Date,
  notes: string,
  data: string,
  0 //change it later to user_id 
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
          data,
          notes,
          user_id
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      data,
      notes,
      user_id,
    ],
  );
}


