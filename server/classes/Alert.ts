class Alert implements I_Alert {
	alert_id: string;
	token_id: string;
	alert_date: Date;
	access_ip?: string;
	log?: string;

	constructor(alert_id: string, token_id: string, alert_date: Date) {
		this.alert_id = alert_id;
		this.token_id = token_id;
		this.alert_date = alert_date;
	}
	getAlertID(): string {
		return this.alert_id;
	}
	getTokenID(): string {
		return this.token_id;
	}
	getGrade(): number {
		//TODO: get the grade of the token
		throw new Error("Method not implemented.");
	}
	getAlertDate(): Date {
		return this.alert_date;
	}
	getAccessIP(): string {
		return this.access_ip!;
	}
	setAccessIP(access_ip: string): void {
		this.access_ip = access_ip;
	}
	getLog(): string {
		return this.log!;
	}
	setLog(log: string): void {
		this.log = log;
	}
}
