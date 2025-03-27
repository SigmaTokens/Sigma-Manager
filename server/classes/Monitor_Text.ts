import fs from "fs";
import { Monitor } from "./Monitor";
import { exec } from "child_process";

export class Monitor_Text extends Monitor {
	file: string;
	constructor(file: string) {
		super();
		this.file = file;
	}

	monitor(): void {}
}
