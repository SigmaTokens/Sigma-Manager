import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import { get_all_types } from "./types";
import { begin_transaction, commit, rollback } from "./helpers";

export async function init_honeytokens_table(database: Database<sqlite3.Database, sqlite3.Statement>) {
	await database.exec(`
    CREATE TABLE IF NOT EXISTS honeytokens (
      token_id VARCHAR PRIMARY KEY,
      group_id VARCHAR,
      type_id INTEGER,
      grade INTEGER,
      creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      expire_date DATETIME,
	  location VARCHAR, 
	  file_name VARCHAR,
	  data TEXT,
      notes TEXT,
      FOREIGN KEY (type_id) REFERENCES types(type_id) ON DELETE CASCADE
    );
  `);
}

export async function get_all_honeytokens(database: Database<sqlite3.Database, sqlite3.Statement>) {
	return await database.all(
		`SELECT token_id, 
					 group_id, 
					 type_id, 
					 grade,
					 creation_date, 
					 expire_date, 
					 location, 
					 file_name,
					 data,
					 notes
		   FROM honeytokens`
	);
}

export async function get_honeytoken_by_token_id(
	database: Database<sqlite3.Database, sqlite3.Statement>,
	token_id: String
) {
	return await database.get(
		`
    SELECT token_id,
           group_id,
           type_id,
           grade,
           creation_date,
           expire_date,
		   location , 
	  	   file_name ,
		   data,
           notes
      FROM honeytokens
    WHERE token_id = ?;
    `,
		[token_id]
	);
}

export async function get_honeytokens_by_type_id(
	database: Database<sqlite3.Database, sqlite3.Statement>,
	type_id: String
) {
	return await database.all(
		`
    SELECT token_id,
           group_id,
           type_id,
           grade,
           creation_date,
           expire_date,
		   location , 
	  	   file_name ,
		   data,
           notes
    FROM honeytokens
    WHERE type_id = ?;
    `,
		[type_id]
	);
}

export async function get_honeytokens_by_group_id(
	database: Database<sqlite3.Database, sqlite3.Statement>,
	group_id: String
) {
	return await database.all(
		`
    SELECT token_id,
           group_id,
           type_id,
           grade,
           creation_date,
           expire_date,
		   location , 
	  	   file_name,
           notes,
           data
    FROM honeytokens
    WHERE group_id = ?;
    `,
		[group_id]
	);
}

export async function delete_all_honeytokens(database: Database<sqlite3.Database, sqlite3.Statement>) {
	return await database.run(`DELETE FROM honeytokens`);
}

export async function delete_honeytoken_by_id(
	database: Database<sqlite3.Database, sqlite3.Statement>,
	token_id: String
) {
	try {
		await begin_transaction(database);

		await database.run(`DELETE FROM alerts WHERE token_id = ?`, [token_id]);

		await database.run(`DELETE FROM honeytokens WHERE token_id = ?`, [token_id]);

		await commit(database);
	} catch (error) {
		await rollback(database);
	}
}

export async function delete_honeytokens_by_type_id(
	database: Database<sqlite3.Database, sqlite3.Statement>,
	type_id: String
) {
	try {
		await begin_transaction(database);

		await database.run(`DELETE FROM alerts WHERE type_id = ?`, [type_id]);

		await database.run(`DELETE FROM honeytokens WHERE type_id = ?`, [type_id]);

		await commit(database);
	} catch (error) {
		await rollback(database);
	}
}

export async function delete_honeytokens_by_group_id(
	database: Database<sqlite3.Database, sqlite3.Statement>,
	group_id: String
) {
	try {
		await begin_transaction(database);

		await database.run(`DELETE FROM alerts WHERE group_id = ?`, [group_id]);

		await database.run(`DELETE FROM honeytokens WHERE group_id = ?`, [group_id]);

		await commit(database);
	} catch (error) {
		await rollback(database);
	}
}

export async function insert_honeytoken(
	database: Database<sqlite3.Database, sqlite3.Statement>,
	token_id: string,
	group_id: string,
	type_id: any,
	grade: number,
	creation_date: Date,
	expiration_date: Date,
	location: string,
	file_name: string,
	data: string,
	notes: string
) {
	await database.run(
		`INSERT INTO honeytokens (token_id, group_id, type_id, grade, creation_date, expire_date, location , file_name ,data, notes ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[token_id, group_id, type_id, grade, creation_date, expiration_date, location, file_name, data, notes]
	);
}

export async function dummy_populate_honeytokens(database: Database<sqlite3.Database, sqlite3.Statement>) {
	await delete_all_honeytokens(database);
	const honeytokens = [];

	const types = await get_all_types(database);

	if (types.length === 0) throw new Error("[-] No types found in types table");

	for (let i = 0; i < 10; i++) {
		honeytokens.push({
			token_id: uuidv4(),
			group_id: `group_${Math.floor(Math.random() * 5) + 1}`,
			type_id: types[Math.floor(Math.random() * types.length)].type_id,
			grade: Math.floor(Math.random() * 10) + 1,
			creation_date: new Date(Date.now() - Math.random() * 10000000000).toISOString().split("T")[0],
			expire_date: new Date(Date.now() + Math.random() * 10000000000).toISOString().split("T")[0],
			location: "sample location",
			file_name: "sample file_name",
			data: `Sample data for token ${i + 1}`,
			notes: `Sample notes for token ${i + 1}`,
		});
	}

	for (const token of honeytokens) {
		await database.run(
			`INSERT INTO honeytokens (token_id, group_id, type_id, grade, creation_date, expire_date, location , file_name ,data, notes ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				token.token_id,
				token.group_id,
				token.type_id,
				token.grade,
				token.creation_date,
				token.expire_date,
				token.location,
				token.file_name,
				token.data,
				token.notes,
			]
		);
	}
}
