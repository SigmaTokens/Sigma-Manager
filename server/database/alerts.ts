const sql = (strings: TemplateStringsArray, ...values: any[]) => String.raw(strings, ...values);
import { v4 as uuidv4 } from 'uuid';
import { get_all_honeytokens } from './honeytokens';
import { get_random_date, get_random_ip, begin_transaction, commit, rollback } from './helpers';
import { Globals } from '../globals';
import { Constants } from '../constants';

export async function init_alerts_table() {
  await Globals.app.locals.db.exec(sql`
    CREATE TABLE IF NOT EXISTS alerts (
      alert_id VARCHAR PRIMARY KEY,
      token_id VARCHAR,
      alert_epoch VARCHAR,
      accessed_by INTEGER,
      log TEXT,
      archive BOOLEAN DEFAULT 0,
      FOREIGN KEY (token_id) REFERENCES honeytokens (token_id) ON DELETE CASCADE
    );
  `);
}

export async function create_alert_to_token_id(
  token_id: string,
  alert_epoch: number,
  accessed_by: string,
  log: string,
  archive: boolean = false,
) {
  try {
    await begin_transaction();

    await Globals.app.locals.db.run(
      sql`
        INSERT INTO
          alerts (
            alert_id,
            token_id,
            alert_epoch,
            accessed_by,
            log,
            archive
          )
        VALUES
          (?, ?, ?, ?, ?, ?);
      `,
      [uuidv4(), token_id, alert_epoch, accessed_by, log, archive],
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
    archive: boolean;
  }>,
) {
  try {
    await begin_transaction();

    for (const alert of alerts) {
      await Globals.app.locals.db.run(
        sql`
          INSERT INTO
            alerts (
              alert_id,
              token_id,
              alert_epoch,
              accessed_by,
              log,
              archive
            )
          VALUES
            (?, ?, ?, ?, ?, ?);
        `,
        [uuidv4(), alert.token_id, alert.alert_epoch, alert.accessed_by, alert.log, alert.archive],
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
  return await Globals.app.locals.db.all(sql`
    SELECT
      alert_id,
      token_id,
      alert_epoch,
      accessed_by,
      log
    FROM
      alerts
    ORDER BY
      alert_epoch DESC
  `);
}

export async function get_all_alerts_join() {
  return await Globals.app.locals.db.all(sql`
    SELECT
      alerts.alert_id,
      alerts.token_id,
      alerts.alert_epoch,
      alerts.accessed_by,
      alerts.log,
      alerts.archive,
      honeytokens.grade AS grade,
      honeytokens.location AS location,
      honeytokens.file_name AS file_name,
      agents.agent_ip AS agent_ip,
      agents.agent_port AS agent_port
    FROM
      alerts
      LEFT JOIN honeytokens ON alerts.token_id = honeytokens.token_id
      LEFT JOIN agents ON honeytokens.agent_id = agents.agent_id
    ORDER BY
      alerts.alert_epoch DESC
  `);
}

export async function get_alert_by_alert_id(alert_id: String) {
  return await Globals.app.locals.db.get(
    sql`
      SELECT
        alert_id,
        token_id,
        alert_epoch,
        accessed_by,
        log
      FROM
        alerts
      WHERE
        alert_id = ?;
    `,
    [alert_id],
  );
}

export async function get_alert_by_token_id(token_id: String) {
  return await Globals.app.locals.db.all(
    sql`
      SELECT
        alert_id,
        token_id,
        alert_epoch,
        accessed_by,
        log
      FROM
        alerts
      WHERE
        token_id = ?;
    `,
    [token_id],
  );
}

export async function delete_all_alerts() {
  await Globals.app.locals.db.run(sql` DELETE FROM alerts`);
}

export async function delete_alert_by_alert_id(alert_id: string) {
  try {
    await Globals.app.locals.db.run(
      sql`
        DELETE FROM alerts
        WHERE
          alert_id = ?;
      `,
      [alert_id],
    );
  } catch (error) {
    console.error(
      Constants.TEXT_RED_COLOR,
      `Failed to delete alert with id ${alert_id}:`,
      error,
      Constants.TEXT_WHITE_COLOR,
    );
    throw error;
  }
}

export async function set_archive_by_alert_id(alert_id: string, archive: boolean) {
  try {
    await Globals.app.locals.db.run(`UPDATE alerts SET archive = ? WHERE alert_id = ?;`, [archive, alert_id]);
  } catch (error) {
    console.error(
      Constants.TEXT_RED_COLOR,
      `Failed to set alert with id ${alert_id}:`,
      error,
      Constants.TEXT_WHITE_COLOR,
    );
    throw error;
  }
}
