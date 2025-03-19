import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";

import { init_tables, print_table } from "./helpers";
import { populate_types_table } from "./types";
import { dummy_populate_honeytokens } from "./honeytokens";
import { dummy_populate_alerts } from "./alerts";

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

    if (process.env.MODE === "dev") {
      await print_table(database, "types");
      await dummy_populate_honeytokens(database);
      await dummy_populate_alerts(database);
      await print_table(database, "honeytokens");
      await print_table(database, "alerts");
    }

    return database;
  } catch (error) {
    console.error("[-] Failed to initialize database:", error);
    process.exit(-1);
  }
}
