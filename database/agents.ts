import { Database } from 'sqlite'
import sqlite3 from 'sqlite3'

export async function init_agents_table(
  database: Database<sqlite3.Database, sqlite3.Statement>,
) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      agent_id VARCHAR PRIMARY KEY ,
      agent_name TEXT NOT NULL,
      agent_ip TEXT NOT NULL,
      agent_port INTEGER NOT NULL
    );
  `)
}

export async function insert_agent(
  database: Database<sqlite3.Database, sqlite3.Statement>,
  agent_id: string,
  ip: string,
  name: string,
  port: number,
) {
  await database.run(
    `INSERT INTO agents (agent_id, agent_ip, agent_name, agent_port) VALUES (?, ?, ?, ?)`,
    [agent_id, ip, name, port],
  )
}

export async function get_all_agents(
  database: Database<sqlite3.Database, sqlite3.Statement>,
) {
  return await database.all(`SELECT * FROM agents`)
}
