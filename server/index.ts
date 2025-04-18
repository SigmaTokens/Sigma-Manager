import express from 'express';
import cors from 'cors';
import { serveClient } from './routes/client';
import { serveHoneytokens } from './routes/honeytokens';
import { serveAlerts } from './routes/alerts';
import { serveAgents } from './routes/agents';
import { isAdmin } from './utilities/auth';
import { startDatabase } from '../database/database';
import { Constants } from './constants';
import { Globals } from './globals';
main();

function main(): void {
  const app = express();
  app.use(express.json());

  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  const port = process.env.PORT || 3000;

  isAdmin().then((isAdmin) => {
    if (!isAdmin) {
      console.error(Constants.TEXT_RED_COLOR, 'Please run as administrator');
      return;
    }
    startDatabase()
      .then((database) => {
        app.locals.db = database;
        console.log('[+] Database connection initialized:', app.locals.db);

        serveHoneytokens(app, database);
        serveAlerts(app);
        serveAgents(app, database);
        serveClient(app);

        Globals.app = app;

        app.listen(port, () => {
          console.log(`[+] Server running on port ${port}`);
        });
      })
      .catch((error) => {
        console.error('[-] Failed to initialize server:', error);
        process.exit(1);
      });
  });
}
