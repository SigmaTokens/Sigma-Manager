const sql = (strings: TemplateStringsArray, ...values: any[]) => String.raw(strings, ...values);
import { v4 as uuidv4 } from 'uuid';
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

export async function create_honeytoken_alert(
  token_id: string,
  alert_epoch: number,
  accessed_by: string,
  log: string,
  archive = false,
) {
  try {
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
    return true;
  } catch {
    return false;
  }
}

export async function get_all_user_alerts(user_id: string) {
  return await Globals.app.locals.db.all(
    sql`
      SELECT DISTINCT
        alerts.alert_id,
        alerts.token_id,
        alerts.alert_epoch,
        alerts.accessed_by,
        alerts.log,
        alerts.archive,
        honeytokens.grade AS grade,
        honeytokens.location AS location,
        honeytokens.file_name AS file_name,
        agents.agent_id AS agent_id,
        agents.agent_name AS agent_name
      FROM
        alerts
        LEFT JOIN honeytokens ON alerts.token_id = honeytokens.token_id
        OR alerts.token_id = honeytokens.group_id
        LEFT JOIN agents ON honeytokens.agent_id = agents.agent_id
      WHERE
        agents.user_id = ?
      ORDER BY
        alerts.alert_epoch DESC
    `,
    [user_id],
  );
}

export async function get_honeytoken_alert_by_alert_id(token_id: string, alert_id: string) {
  return Globals.app.locals.db.get(
    sql`
      SELECT
        alert_id,
        token_id,
        alert_epoch,
        accessed_by,
        log,
        archive
      FROM
        alerts
      WHERE
        token_id = ?
        AND alert_id = ?;
    `,
    [token_id, alert_id],
  );
}

export async function delete_all_honeytoken_alerts(token_id: string) {
  await Globals.app.locals.db.run(
    sql`
      DELETE FROM alerts
      WHERE
        token_id = ?;
    `,
    [token_id],
  );
}

export async function delete_honeytoken_alert_by_alert_id(token_id: string, alert_id: string) {
  try {
    await Globals.app.locals.db.run(
      sql`
        DELETE FROM alerts
        WHERE
          token_id = ?
          AND alert_id = ?;
      `,
      [token_id, alert_id],
    );
  } catch (error) {
    console.error(Constants.TEXT_RED_COLOR, `Failed to delete alert ${alert_id}:`, error, Constants.TEXT_DEFAULT_COLOR);
    throw error;
  }
}

export async function set_honeytoken_alert_archive_by_alert_id(token_id: string, alert_id: string, archive: boolean) {
  try {
    await Globals.app.locals.db.run(
      sql`
        UPDATE alerts
        SET
          archive = ?
        WHERE
          token_id = ?
          AND alert_id = ?;
      `,
      [archive, token_id, alert_id],
    );
    return true;
  } catch (error) {
    console.error(
      Constants.TEXT_RED_COLOR,
      `Failed to set archive flag on alert ${alert_id}:`,
      error,
      Constants.TEXT_DEFAULT_COLOR,
    );
    return false;
  }
}
