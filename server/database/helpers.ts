const sql = (strings: TemplateStringsArray, ...values: any[]) => String.raw(strings, ...values);
import { init_alerts_table } from './alerts';
import { init_honeytokens_table } from './honeytokens';
import { init_types_table } from './types';
import { init_whitelist_table } from './whitelist';
import { init_agents_table } from './agents';
import { Globals } from '../globals';
import { Constants } from '../constants';

export async function is_table_exists(table_name: string) {
  const result = await Globals.app.locals.db.get(
    sql`
      SELECT
        name
      FROM
        sqlite_master
      WHERE
        type = 'table'
        AND name = ?
    `,
    [table_name],
  );
  return result !== undefined;
}

export async function init_tables() {
  if (!(await is_table_exists('types'))) {
    await init_types_table();
    if (process.env.MODE === 'dev')
      console.log(Constants.TEXT_GREEN_COLOR, 'Initiated types table successfully', Constants.TEXT_WHITE_COLOR);
  }
  if (!(await is_table_exists('honeytokens'))) {
    await init_honeytokens_table();
    if (process.env.MODE === 'dev')
      console.log(Constants.TEXT_GREEN_COLOR, 'Initiated honeytokens table successfully', Constants.TEXT_WHITE_COLOR);
  }
  if (!(await is_table_exists('alerts'))) {
    await init_alerts_table();
    if (process.env.MODE === 'dev')
      console.log(Constants.TEXT_GREEN_COLOR, 'Initiated alerts table successfully', Constants.TEXT_WHITE_COLOR);
  }
  if (!(await is_table_exists('whitelist'))) {
    await init_whitelist_table();
    if (process.env.MODE === 'dev')
      console.log(Constants.TEXT_GREEN_COLOR, 'Initiated whitelist table successfully', Constants.TEXT_WHITE_COLOR);
  }
  if (!(await is_table_exists('agents'))) {
    await init_agents_table();
    if (process.env.MODE === 'dev')
      console.log(Constants.TEXT_GREEN_COLOR, 'Initiated agents table successfully', Constants.TEXT_WHITE_COLOR);
  }
}

export function get_random_ip() {
  function octet() {
    return Math.floor(Math.random() * 256);
  }
  let ip;
  do {
    ip = `${octet()}.${octet()}.${octet()}.${octet()}`;
  } while (
    ip === '0.0.0.0' ||
    ip === '127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.')
  );
  return ip;
}

export function get_random_date() {
  const start = new Date(1970, 0, 1);
  const end = new Date(2030, 11, 31);
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const date = new Date(randomTime);
  return date;
}

export async function begin_transaction() {
  await Globals.app.locals.db.run('BEGIN TRANSACTION');
}

export async function commit() {
  await Globals.app.locals.db.run('COMMIT');
}

export async function rollback() {
  await Globals.app.locals.db.run('ROLLBACK');
}
