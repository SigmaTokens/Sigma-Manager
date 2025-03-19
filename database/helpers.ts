import { Database } from "sqlite";
import sqlite3 from "sqlite3";

import { init_alerts_table } from "./alerts";
import { init_honeytokens_table } from "./honeytokens";
import { init_types_table } from "./types";
import { init_whitelist_table } from "./whitelist";

export async function is_table_exists(
  database: Database<sqlite3.Database, sqlite3.Statement>,
  table_name: string
) {
  const result = await database.get(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    [table_name]
  );
  console.log(`[+] Table '${table_name}' status:`, result ? "up" : "down");
  return result !== undefined;
}

export async function init_tables(
  database: Database<sqlite3.Database, sqlite3.Statement>
) {
  if (!(await is_table_exists(database, "types"))) {
    await init_types_table(database);
    console.log("[+] Initiated types table successfully");
  }
  if (!(await is_table_exists(database, "honeytokens"))) {
    await init_honeytokens_table(database);
    console.log("[+] Initiated honeytokens table successfully");
  }
  if (!(await is_table_exists(database, "alerts"))) {
    await init_alerts_table(database);
    console.log("[+] Initiated alerts table successfully");
  }
  if (!(await is_table_exists(database, "whitelist"))) {
    await init_whitelist_table(database);
    console.log("[+] Initiated whitelist table successfully");
  }
}

export async function print_table(
  database: Database<sqlite3.Database, sqlite3.Statement>,
  table_name: string
) {
  try {
    const rows = await database.all(`SELECT * FROM ${table_name}`);
    console.log(`[+] Table '${table_name}' data (${rows.length} rows):`, rows);
  } catch (error) {
    console.error(
      `[-] Failed to fetch data from table '${table_name}':`,
      error
    );
  }
}
