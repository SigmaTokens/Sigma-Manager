
import { v4 as uuidv4 } from 'uuid'; 


const sql = (strings: TemplateStringsArray, ...values: any[]) =>
    String.raw(strings, ...values);
  import { Globals } from '../globals';

  
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
    const userId = uuidv4(); 
  
    await Globals.app.locals.db.run(
      sql`
        INSERT INTO
          users (id, username, password)
        VALUES
          (?, ?, ?)
      `,
      [userId, username, password],
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
  
    
    const isValid = (password === user.password);
    return isValid;
  }
  
  