import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { init_tables } from './helpers';
import { populate_types_table } from './types';
import { init_users_table } from './users';
import { Globals } from '../globals';
import { Constants } from '../constants';

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
  } catch (error) {
    if (process.env.MODE === 'dev')
      console.error(Constants.TEXT_RED_COLOR, 'Failed to initialize database:', error, Constants.TEXT_WHITE_COLOR);
    process.exit(-1);
  }
}
