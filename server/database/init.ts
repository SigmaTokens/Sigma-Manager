import { Globals } from '../globals';
import { init_users_table } from './users';
import { init_agents_table } from './agents';

export async function initializeSchema() {
  await Globals.app.locals.db.run('PRAGMA foreign_keys = ON;');

  await init_users_table(); 
  await init_agents_table(); 
