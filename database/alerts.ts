import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import { get_all_honeytokens } from "./honeytokens";
import { get_random_date, get_random_time, get_random_ip } from "./helpers";

export async function init_alerts_table(
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

export async function get_all_alerts(
  database: Database<sqlite3.Database, sqlite3.Statement>
) {
  return await database.all(
    `SELECT 
      alert_id, 
      token_id, 
      alert_grade, 
      alert_date, 
      alert_time, 
      access_ip, 
      log 
    FROM alerts 
    ORDER BY alert_date DESC, alert_time DESC`
  );
}

export async function delete_all_alerts(
  database: Database<sqlite3.Database, sqlite3.Statement>
) {
  await database.run(`DELETE FROM alerts`);
}

export async function dummy_populate_alerts(
  database: Database<sqlite3.Database, sqlite3.Statement>
) {
  await delete_all_alerts(database);

  const alerts = [];
  const honeytokens = await get_all_honeytokens(database);

  if (honeytokens.length === 0)
    throw new Error("[-] No tokens found in honeytokens table");

  for (let i = 0; i < 100; i++) {
    alerts.push({
      alert_id: uuidv4(),
      token_id:
        honeytokens[Math.floor(Math.random() * honeytokens.length)].token_id,
      alert_grade: Math.floor(Math.random() * 10) + 1,
      alert_date: get_random_date(),
      alert_time: get_random_time(),
      access_ip: get_random_ip(),
      log: `Suspicious activity detected on token ${i + 1}`,
    });
  }

  for (const alert of alerts) {
    await database.run(
      `INSERT INTO alerts (alert_id, token_id, alert_grade, alert_date, alert_time, access_ip, log)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        alert.alert_id,
        alert.token_id,
        alert.alert_grade,
        alert.alert_date,
        alert.alert_time,
        alert.access_ip,
        alert.log,
      ]
    );
  }
}
