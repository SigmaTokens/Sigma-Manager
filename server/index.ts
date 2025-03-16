import express from "express";
import { serveClient } from "./routes/client";
import { dbPromise } from "../database/database";

const app = express();
const port = process.env.PORT || 3000;

async function init_database() {
  try {
    const database = await dbPromise;
    console.log("Database connection object:", database);
    app.locals.db = database;
  } catch (error) {
    console.error("Error fetching database connection object:", error);
    process.exit(-1);
  }
}

serveClient(app);

init_database();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
