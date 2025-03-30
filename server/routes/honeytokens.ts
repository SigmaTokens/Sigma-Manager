import { Router, Express } from "express";
import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";
import {
	get_all_honeytokens,
	get_honeytoken_by_token_id,
	get_honeytokens_by_type_id,
	get_honeytokens_by_group_id,
	delete_honeytoken_by_id,
	delete_honeytokens_by_type_id,
	delete_honeytokens_by_group_id,
	insert_honeytoken,
} from "../../database/honeytokens";
import { Honeytoken_Text } from "../classes/Honeytoken_Text";
import { Globals } from "../globals";

export function serveHoneytokens(app: Express, database: Database<sqlite3.Database, sqlite3.Statement>) {
	const router = Router();

	router.get("/honeytokens", async (req, res) => {
		try {
			const honeytokens = await get_all_honeytokens(database);
			res.json(honeytokens);
		} catch (error) {
			console.error("[-] Failed to fetch honeytokens:", error);
			res.status(500).json({ failure: error });
		}
	});

	router.get("/honeytokens/token/:token_id", async (req, res) => {
		const { token_id } = req.params;
		try {
			const honeytoken = await get_honeytoken_by_token_id(database, token_id);
			res.json(honeytoken);
		} catch (error) {
			console.error("[-] Failed to fetch honeytoken by token_id:", error);
			res.status(500).json({ failure: error });
		}
	});

	router.get("/honeytokens/type/:type_id", async (req, res) => {
		const { type_id } = req.params;
		try {
			const honeytokens = await get_honeytokens_by_type_id(database, type_id);
			res.json(honeytokens);
		} catch (error) {
			console.error("[-] Failed to fetch honeytokens by type_id:", error);
			res.status(500).json({ failure: error });
		}
	});

	router.get("/honeytokens/group/:group_id", async (req, res) => {
		const { group_id } = req.params;
		try {
			const honeytokens = await get_honeytokens_by_group_id(database, group_id);
			res.json(honeytokens);
		} catch (error) {
			console.error("[-] Failed to fetch honeytokens by group_id:", error);
			res.status(500).json({ failure: error });
		}
	});

	router.delete("/honeytokens/token/:token_id", async (req, res) => {
		const { token_id } = req.params;
		try {
			await delete_honeytoken_by_id(database, token_id);
			res.json({ success: true });
		} catch (error) {
			console.error("[-] Failed to delete honeytoken:", error);
			res.status(500).json({ failure: error });
		}
	});

	router.delete("/honeytokens/type/:type_id", async (req, res) => {
		const { type_id } = req.params;
		try {
			await delete_honeytokens_by_type_id(database, type_id);
			res.json({ success: true });
		} catch (error) {
			console.error("[-] Failed to delete honeytokens:", error);
			res.status(500).json({ failure: error });
		}
	});

	router.delete("/honeytokens/group/:group_id", async (req, res) => {
		const { group_id } = req.params;
		try {
			await delete_honeytokens_by_group_id(database, group_id);
			res.json({ success: true });
		} catch (error) {
			console.error("[-] Failed to delete honeytokens:", error);
			res.status(500).json({ failure: error });
		}
	});

	router.post("/honeytoken/text", (req, res) => {
		try {
			console.log("working");
			//console.log(req);

			/*
        TODO: 
        1. check if file name is initial - create a name from a list
        2. check if content is initial - create content from a list - optional ? 
        3. check if location is initial or does not exist - send error
        4. create Honeytoken to array in globals.ts
        5. write the honeytoken to the database
		6. create mapping for HoneytokenType
      */
			console.log(req.body);
			const { file_name, location, grade, expiration_date, data, notes } = req.body;

			console.log("help");

			const newToken = new Honeytoken_Text(
				uuidv4(),
				uuidv4(),
				"text",
				expiration_date,
				grade,
				notes,
				location,
				file_name
			);

			Globals.tokens.push(newToken);

			//TODO: check if file exists - if not - create it using createFile in Honeytoken_Text.ts

			const filePath = path.join(location, file_name);

			if (!fs.existsSync(filePath)) {
				fs.writeFileSync(filePath, data);
			}

			newToken.startAgent();

			console.log("----------------not stuck test----------------");

			insert_honeytoken(
				database,
				newToken.getTokenID(),
				newToken.getGroupID(),
				1,
				newToken.getGrade(),
				newToken.getCreationDate(),
				newToken.getExpirationDate(),
				newToken.getLocation(),
				newToken.getFileName(),
				data,
				newToken.getNotes()
			);

			res.send().status(200);
		} catch (error: any) {
			res.status(500).json({ failure: error.message });
		}
	});

	app.use("/api", router);
}
