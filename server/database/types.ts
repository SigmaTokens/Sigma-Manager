const sql = (strings: TemplateStringsArray, ...values: any[]) =>
  String.raw(strings, ...values);
import { Globals } from '../globals';

export async function init_types_table() {
  await Globals.app.locals.db.exec(sql`
    CREATE TABLE IF NOT EXISTS types (
      type_id INTEGER PRIMARY KEY AUTOINCREMENT,
      type_name VARCHAR NOT NULL,
      description TEXT
    );
  `);
}

export async function get_all_types() {
  return await Globals.app.locals.db.all(sql`
    SELECT
      type_id
    FROM
      types
  `);
}

export async function populate_types_table() {
  const types = [
    {
      type_id: 1,
      type_name: 'text_file',
      description:
        'A text-based file (e.g., Word, PDF) designed to act as a honeytoken. When accessed or downloaded by unauthorized users, it triggers an alert to expose potential data breaches or insider threats.',
    },
    {
      type_id: 2,
      type_name: 'api_key',
      description:
        'A fake API key embedded in code or configuration files. If used by unauthorized applications or users, it triggers an alert to detect misuse or unauthorized access to systems.',
    },
    {
      type_id: 3,
      type_name: 'database_record',
      description:
        'A fake record inserted into a database. When queried or accessed, it triggers an alert to identify unauthorized database access or data exfiltration attempts.',
    },
  ];

  for (const type of types) {
    await Globals.app.locals.db.run(
      sql`
        INSERT OR REPLACE INTO
          types (type_id, type_name, description)
        VALUES
          (?, ?, ?)
      `,
      [type.type_id, type.type_name, type.description],
    );
  }
}
