import { v4 as uuidv4 } from 'uuid';
import { get_all_honeytokens } from './honeytokens';
import {
  get_random_date,
  get_random_ip,
  begin_transaction,
  commit,
  rollback,
} from './helpers';
import { Globals } from '../globals';

export async function init_alerts_table() {
  await Globals.app.locals.db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      alert_id VARCHAR PRIMARY KEY,
      token_id VARCHAR,
      alert_epoch VARCHAR,
      accessed_by INTEGER,
      log TEXT,
      FOREIGN KEY (token_id) REFERENCES honeytokens(token_id) ON DELETE CASCADE
    );
  `);
}

export async function create_alert_to_token_id(
  token_id: string,
  alert_epoch: number,
  accessed_by: string,
  log: string,
) {
  try {
    await begin_transaction();

    await Globals.app.locals.db.run(
      `
      INSERT INTO alerts (
        alert_id,
        token_id,
        alert_epoch,
        accessed_by,
        log
      ) 
      VALUES (?, ?, ?, ?, ?);
      `,
      [uuidv4(), token_id, alert_epoch, accessed_by, log],
    );

    await commit();
    return true;
  } catch (error) {
    await rollback();
    return false;
  }
}

export async function create_alerts_to_token_id(
  alerts: Array<{
    token_id: string;
    alert_epoch: number;
    accessed_by: string;
    log: string;
  }>,
) {
  try {
    await begin_transaction();

    for (const alert of alerts) {
      await Globals.app.locals.db.run(
        `
        INSERT INTO alerts (
          alert_id,
          token_id,
          alert_epoch,
          accessed_by,
          log
        ) 
        VALUES (?, ?, ?, ?, ?);
        `,
        [
          uuidv4(),
          alert.token_id,
          alert.alert_epoch,
          alert.accessed_by,
          alert.log,
        ],
      );
    }

    await commit();
    return true;
  } catch (error) {
    await rollback();
    return false;
  }
}

export async function get_all_alerts() {
  return await Globals.app.locals.db.all(
    `SELECT alert_id, 
      				  token_id, 
      				  alert_epoch,
      				  accessed_by, 
      			 	  log 
    	FROM alerts 
       ORDER BY alert_epoch DESC`,
  );
}

export async function get_alert_by_alert_id(alert_id: String) {
  return await Globals.app.locals.db.get(
    `SELECT alert_id,
           		      token_id,
           			  alert_epoch,
           			  accessed_by,
           			  log
           FROM alerts
    	 WHERE alert_id = ?;`,
    [alert_id],
  );
}

export async function get_alert_by_token_id(token_id: String) {
  return await Globals.app.locals.db.all(
    `
    SELECT alert_id,
           		 token_id,
           		 alert_epoch,
          		 accessed_by,
           		 log
      FROM alerts
     WHERE token_id = ?; `,
    [token_id],
  );
}

export async function delete_all_alerts() {
  await Globals.app.locals.db.run(`DELETE FROM alerts`);
}

export async function delete_alert_by_alert_id(alert_id: string) {
  try {
    await Globals.app.locals.db.run(`DELETE FROM alerts WHERE alert_id = ?;`, [
      alert_id,
    ]);
  } catch (error) {
    console.error(`[-] Failed to delete alert with id ${alert_id}:`, error);
    throw error;
  }
}

export async function dummy_populate_alerts() {
  await delete_all_alerts();

  const alerts = [];
  const honeytokens = await get_all_honeytokens();

  if (honeytokens.length === 0)
    throw new Error('[-] No tokens found in honeytokens table');

  for (let i = 0; i < 10; i++) {
    alerts.push({
      alert_id: uuidv4(),
      token_id:
        honeytokens[Math.floor(Math.random() * honeytokens.length)].token_id,
      alert_epoch: get_random_date().getTime(),
      accessed_by: get_random_ip(),
      log: `Suspicious activity detected on token ${i + 1}`,
    });
  }

  for (const alert of alerts) {
    await Globals.app.locals.db.run(
      `INSERT INTO alerts (alert_id, token_id, alert_epoch, accessed_by, log) VALUES (?, ?, ?, ?, ?)`,
      [
        alert.alert_id,
        alert.token_id,
        alert.alert_epoch,
        alert.accessed_by,
        alert.log,
      ],
    );
  }
}
