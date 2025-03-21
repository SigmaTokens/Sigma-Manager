import express from "express";
import cors from "cors";
import { serveClient } from "./routes/client";
import { serveHoneytokens } from "./routes/honeytokens";
import { serveAlerts } from "./routes/alerts";
import { startDatabase } from "../database/database";

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

startDatabase()
  .then((database) => {
    app.locals.db = database;
    console.log("[+] Database connection initialized:", app.locals.db);

    serveHoneytokens(app);
    serveAlerts(app);

    serveClient(app);

    app.listen(port, () => {
      console.log(`[+] Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("[-] Failed to initialize server:", error);
    process.exit(1);
  });
