interface I_Alert {
	getAlertID(): string;
	getTokenID(): string;
	getGrade(): number;
	getAlertDate(): Date;
	getAccessIP(): string;
	getLog(): string;
}

interface I_AlertManager {
	createAlert(token_id: string, access_ip: string, log: string): void;
	delete_all_alerts(alert_id: string): void;
}
