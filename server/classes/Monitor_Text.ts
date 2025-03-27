import fs from "fs";
import { Monitor } from "./Monitor";

export class Monitor_Text extends Monitor {
	file: string;
	constructor(file: string) {
		super();
		this.file = file;
	}

	monitor(): void {
		fs.watch(this.file, (eventType, filename) => {
			console.log("Event type: " + eventType + ", filename: " + filename + " modified");
		});
	}
}
