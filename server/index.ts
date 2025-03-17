import express from "express";
import { serveClient } from "./routes/client";
import { serveDatabase } from "./routes/database";

const app = express();
const port = process.env.PORT || 3000;

serveDatabase()
  .then((database) => {
    app.locals.db = database;
    console.log("Database connection initialized:", app.locals.db);

    serveClient(app);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  });
