import { exec } from "child_process";

export function getPlatform(): NodeJS.Platform {
	return process.platform;
}

export function isLinux(): boolean {
	return process.platform === "linux";
}

export function isWindows(): boolean {
	return process.platform === "win32";
}

export function windows_enable_auditing(): void {
	exec('auditpol.exe /set /subcategory:"Object Access" /success:enable', (error, stdout, stderr) => {
		if (error) {
			console.error(`Error enabling audit policy: ${error}`);
			process.exit(1);
		}
		console.log("Audit Object Access enabled:", stdout);
	});
}
