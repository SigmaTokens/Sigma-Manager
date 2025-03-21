import { Router, Express } from "express";
import { get_all_honeytokens } from "../../database/honeytokens";

export function serveHoneytokens(app: Express) {
  const router = Router();

  router.get("/honeytokens", async (req, res) => {
    try {
      const db = app.locals.db;
      const honeytokens = await get_all_honeytokens(db);
      res.json(honeytokens);
    } catch (error) {
      console.error("[-] Failed to fetch honeytokens:", error);
      res.status(500).json({ failure: error });
    }
  });

  app.use("/api", router);
}
