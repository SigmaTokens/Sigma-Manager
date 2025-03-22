import { Router, Express } from "express";
import { Database } from "sqlite";
import sqlite3 from "sqlite3";
import {
  get_all_honeytokens,
  delete_honeytoken_by_id,
} from "../../database/honeytokens";

export function serveHoneytokens(
  app: Express,
  database: Database<sqlite3.Database, sqlite3.Statement>
) {
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

  router.delete("/honeytokens/:token_id", async (req, res) => {
    const { token_id } = req.params;
    try {
      await delete_honeytoken_by_id(database, token_id);
      res.json({ success: true });
    } catch (error) {
      console.error("[-] Failed to delete honeytoken:", error);
      res.status(500).json({ failure: error });
    }
  });

  app.use("/api", router);
}
