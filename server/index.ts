import express from "express";
import { serveClient } from "./routes/client";

const app = express();
const port = process.env.PORT || 3000;

serveClient(app);

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
