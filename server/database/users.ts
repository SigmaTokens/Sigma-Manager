const sql = (strings: TemplateStringsArray, ...values: any[]) =>
    String.raw(strings, ...values);
  import { Globals } from '../globals';
  import * as bcrypt from 'bcrypt';
  
  export async function init_users_table() {
    await Globals.app.locals.db.exec(sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR NOT NULL UNIQUE,
        password VARCHAR NOT NULL
      );
    `);
  }
  
  export async function get_all_users() {
    return await Globals.app.locals.db.all(sql`
      SELECT
        user_id, username
      FROM
        users
    `);
  }
  
  export async function add_user(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await Globals.app.locals.db.run(
      sql`
        INSERT INTO
          users (username, password)
        VALUES
          (?, ?)
      `,
      [username, hashedPassword],
    );
  }
  
  export async function check_user_credentials(username: string, password: string) {
    const user = await Globals.app.locals.db.get(sql`
      SELECT
        password
      FROM
        users
      WHERE
        username = ?
    `, [username]);
  
    if (!user) {
      return false;
    }
  
    const isValid = await bcrypt.compare(password, user.password);
    return isValid;
  }
  