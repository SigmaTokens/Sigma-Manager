import express from "express";
import cors from "cors";
import { serveClient } from "./routes/client";
import { serveHoneytokens } from "./routes/honeytokens";
import { serveAlerts } from "./routes/alerts";
import { isAdmin } from "./utilities/auth";
import { startDatabase } from "../database/database";
import { Constants } from "./constants";
import { isWindows, windows_enable_auditing, isMac } from "./utilities/host";

main();

function main(): void {
    const app = express();
    app.use(cors());
    const port = process.env.PORT || 3000;

    isAdmin().then((isAdmin) => {
        if (!isAdmin) {
            console.error(Constants.TEXT_RED_COLOR, "Please run as administrator");
            return;
        }
        init().then(() => {
            startDatabase()
                .then((database) => {
                    app.locals.db = database;
                    console.log("[+] Database connection initialized:", app.locals.db);

                    serveHoneytokens(app, database);
                    serveAlerts(app);
                    serveClient(app);

                    test_honeytoken();

                    app.listen(port, () => {
                        console.log(`[+] Server running on port ${port}`);
                    });
                })
                .catch((error) => {
                    console.error("[-] Failed to initialize server:", error);
                    process.exit(1);
                });
        });
    });
}

async function init() {
    if (isWindows()) {
        await windows_enable_auditing();
    } else if (isMac()) {
        console.log("Running on Mac");
    }
}

import { Honeytoken_Text } from "./classes/Honeytoken_Text";

function test_honeytoken(): void {
    let file = "C:\\Users\\danie\\Desktop\\test.txt";
    if (isMac()) {
        file = "/Users/sh/Desktop/a.txt"; 
    }
    let ht_t = new Honeytoken_Text("1", "1", "text", file);
    ht_t.startAgent();
}