import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function init_database() {
  try {
    const database = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });
    return database;
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}
