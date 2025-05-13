import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

import { init_tables, print_table } from './helpers';
import { populate_types_table } from './types';
// import { dummy_populate_honeytokens } from './honeytokens';
import { dummy_populate_alerts } from './alerts';
import { init_users_table } from './users';
import { Globals } from '../globals';

export async function startDatabase() {
  try {
    const database_absolute_path = path.join(__dirname, 'database.sqlite');
    Globals.app.locals.db = await open({
      filename: database_absolute_path,
      driver: sqlite3.Database,
    });

    await init_tables();
    await init_users_table();

    await populate_types_table();

    if (process.env.MODE === 'dev') {
      // await print_table('types');
      // await dummy_populate_honeytokens();
      // await dummy_populate_alerts();
    }
  } catch (error) {
    if (process.env.MODE === 'dev')
      console.error('[-] Failed to initialize database:', error);
    process.exit(-1);
  }
}
