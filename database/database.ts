import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";

async function init_types_table(
  database: Database<sqlite3.Database, sqlite3.Statement>
) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS types (
      type_id INTEGER PRIMARY KEY AUTOINCREMENT,
      type_name VARCHAR NOT NULL,
      description TEXT
    );
  `);
}

async function init_honeytokens_table(
  database: Database<sqlite3.Database, sqlite3.Statement>
) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS honeytokens (
      token_id VARCHAR PRIMARY KEY,
      group_id VARCHAR,
      type_id INTEGER,
      creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      expire_date DATETIME,
      notes TEXT,
      data TEXT,
      FOREIGN KEY (type_id) REFERENCES types(type_id)
    );
  `);
}

async function init_alerts_table(
  database: Database<sqlite3.Database, sqlite3.Statement>
) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      alert_id VARCHAR PRIMARY KEY,
      token_id VARCHAR,
      alert_grade INTEGER,
      alert_date DATE,
      alert_time TIME,
      access_ip VARCHAR,
      log TEXT,
      FOREIGN KEY (token_id) REFERENCES honeytokens(token_id)
    );
  `);
}

async function init_whitelist_table(
  database: Database<sqlite3.Database, sqlite3.Statement>
) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS whitelist (
      token_id VARCHAR,
      access_ip VARCHAR,
      user VARCHAR,
      PRIMARY KEY (token_id, access_ip),
      FOREIGN KEY (token_id) REFERENCES honeytokens(token_id)
    );
  `);
}

async function is_table_exists(
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

async function init_tables(
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

async function populate_types_table(
  database: Database<sqlite3.Database, sqlite3.Statement>
) {
  const types = [
    {
      type_id: 1,
      type_name: "text_file",
      description:
        "A text-based file (e.g., Word, PDF) designed to act as a honeytoken. When accessed or downloaded by unauthorized users, it triggers an alert to expose potential data breaches or insider threats.",
    },
    {
      type_id: 2,
      type_name: "api_key",
      description:
        "A fake API key embedded in code or configuration files. If used by unauthorized applications or users, it triggers an alert to detect misuse or unauthorized access to systems.",
    },
    {
      type_id: 3,
      type_name: "database_record",
      description:
        "A fake record inserted into a database. When queried or accessed, it triggers an alert to identify unauthorized database access or data exfiltration attempts.",
    },
  ];

  for (const type of types) {
    await database.run(
      `INSERT OR REPLACE INTO types (type_id, type_name, description) VALUES (?, ?, ?)`,
      [type.type_id, type.type_name, type.description]
    );
  }
}

async function print_table(
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

export async function startDatabase() {
  try {
    const database_absolute_path = path.join(
      __dirname,
      "../database/database.sqlite"
    );
    const database: Database<sqlite3.Database, sqlite3.Statement> = await open({
      filename: database_absolute_path,
      driver: sqlite3.Database,
    });

    await init_tables(database);

    await populate_types_table(database);

    await print_table(database, "types");

    return database;
  } catch (error) {
    console.error("[-] Failed to initialize database:", error);
    process.exit(-1);
  }
}
