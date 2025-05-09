import express from 'express';
import cors from 'cors';
import { serveClient } from './routes/client';
import { serveHoneytokens } from './routes/honeytokens';
import { serveAlerts } from './routes/alerts';
import { startDatabase } from './database/database';
import { Globals } from './globals';
import { serveAgents } from './routes/agents';
import { serveHome } from './routes/home';
import { serveGeneral } from './routes/general';
import { Constants } from './constants';
main();

function main(): void {
  const app = express();
  app.use(express.json());

  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  const port = process.env.PORT || 3000;

  Globals.app = app;

  startDatabase()
    .then((database) => {
      console.log(
        Constants.TEXT_CYAN_COLOR,
        'Database connection initialized:',
        Constants.TEXT_WHITE_COLOR,
        app.locals.db,
      );

      serveGeneral();
      serveHome();
      serveHoneytokens();
      serveAlerts();
      serveAgents();
      serveClient();

      Globals.server = app.listen(port, () => {
        console.log(Constants.TEXT_MAGENTA_COLOR, `Server running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error('[-] Failed to initialize server:', error);
      process.exit(1);
    });
}
