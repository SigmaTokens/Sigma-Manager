export function getPlatform(): NodeJS.Platform {
	return process.platform;
}

export function isLinux(): boolean {
	return process.platform === "linux";
}

export function isWindows(): boolean {
	return process.platform === "win32";
}
