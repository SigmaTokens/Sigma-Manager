import fs from "fs";
import { Monitor } from "./Monitor";
import { exec } from "child_process";
import { Constants } from "../constants";
import { isWindows } from "../utilities/host";
import { stderr } from "process";

export class Monitor_Text extends Monitor {
	file: string;
	constructor(file: string) {
		super();
		this.file = file;
	}

	async monitor() {
		if (isWindows()) this.monitorWindows();
	}

	async monitorWindows() {
		const psCommand = `powershell.exe -NoProfile -Command "(Get-Acl '${this.file}').AddAuditRule((New-Object System.Security.AccessControl.FileSystemAuditRule('Everyone','Read','None','None','Success'))); Set-Acl '${this.file}' (Get-Acl '${this.file}')"`;
		exec(psCommand, { encoding: "utf8" }, (error, stdout, stderr) => {
			if (error) {
				console.error(Constants.TEXT_RED_COLOR, `Error adding auditing rule to ${this.file} : ${error}`);
			}
			console.log(Constants.TEXT_GREEN_COLOR, `Successfully added audit_rule to ${this.file}}`);
		});
	}
}
