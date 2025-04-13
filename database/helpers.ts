import { Database } from 'sqlite'
import sqlite3 from 'sqlite3'

import { init_alerts_table } from './alerts'
import { init_honeytokens_table } from './honeytokens'
import { init_types_table } from './types'
import { init_whitelist_table } from './whitelist'
import { init_agents_table } from './agents'

export async function is_table_exists(
  database: Database<sqlite3.Database, sqlite3.Statement>,
  table_name: string,
) {
  const result = await database.get(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    [table_name],
  )
  if (process.env.MODE === 'dev')
    console.log(`[+] Table '${table_name}' status:`, result ? 'up' : 'down')
  return result !== undefined
}

export async function init_tables(
  database: Database<sqlite3.Database, sqlite3.Statement>,
) {
  if (!(await is_table_exists(database, 'types'))) {
    await init_types_table(database)
    if (process.env.MODE === 'dev')
      console.log('[+] Initiated types table successfully')
  }
  if (!(await is_table_exists(database, 'honeytokens'))) {
    await init_honeytokens_table(database)
    if (process.env.MODE === 'dev')
      console.log('[+] Initiated honeytokens table successfully')
  }
  if (!(await is_table_exists(database, 'alerts'))) {
    await init_alerts_table(database)
    if (process.env.MODE === 'dev')
      console.log('[+] Initiated alerts table successfully')
  }
  if (!(await is_table_exists(database, 'whitelist'))) {
    await init_whitelist_table(database)
    if (process.env.MODE === 'dev')
      console.log('[+] Initiated whitelist table successfully')
  }
  if (!(await is_table_exists(database, 'agents'))) {
    await init_agents_table(database)
    if (process.env.MODE === 'dev')
      console.log('[+] Initiated agents table successfully')
  }
}

export async function print_table(
  database: Database<sqlite3.Database, sqlite3.Statement>,
  table_name: string,
) {
  try {
    const rows = await database.all(`SELECT * FROM ${table_name}`)
    if (process.env.MODE === 'dev')
      console.log(`[+] Table '${table_name}' data (${rows.length} rows):`, rows)
  } catch (error) {
    if (process.env.MODE === 'dev')
      console.error(
        `[-] Failed to fetch data from table '${table_name}':`,
        error,
      )
  }
}

export function get_random_ip() {
  function octet() {
    return Math.floor(Math.random() * 256)
  }
  let ip
  do {
    ip = `${octet()}.${octet()}.${octet()}.${octet()}`
  } while (
    ip === '0.0.0.0' ||
    ip === '127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.')
  )
  return ip
}

// export function get_random_time() {
// 	const hours = String(Math.floor(Math.random() * 24)).padStart(2, "0");
// 	const minutes = String(Math.floor(Math.random() * 60)).padStart(2, "0");
// 	const seconds = String(Math.floor(Math.random() * 60)).padStart(2, "0");
// 	return `${hours}:${minutes}:${seconds}`;
// }

export function get_random_date() {
  const start = new Date(1970, 0, 1) // January 1, 1970
  const end = new Date(2030, 11, 31) // December 31, 2030
  const randomTime =
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  const date = new Date(randomTime)
  console.log(date)
  return date
}

export async function begin_transaction(
  database: Database<sqlite3.Database, sqlite3.Statement>,
) {
  await database.run('BEGIN TRANSACTION')
}

export async function commit(
  database: Database<sqlite3.Database, sqlite3.Statement>,
) {
  await database.run('COMMIT')
}

export async function rollback(
  database: Database<sqlite3.Database, sqlite3.Statement>,
) {
  await database.run('ROLLBACK')
}
