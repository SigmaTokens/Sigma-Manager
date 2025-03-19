import { Router, Express } from "express";
import { get_all_alerts } from "../../database/alerts";

export function serveAlerts(app: Express) {
  const router = Router();

  router.get("/alerts", async (req, res) => {
    try {
      const db = app.locals.db;
      if (!db) {
        throw new Error("Database connection not available");
      }
      console.log("Database connection:", db);
      const alerts = await get_all_alerts(db);
      res.json(alerts);
    } catch (error) {
      console.error("[-] Failed to fetch alerts:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch alerts. Please try again later." });
    }
  });

  app.use("/api", router);
}
