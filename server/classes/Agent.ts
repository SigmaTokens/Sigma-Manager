import { I_Agent } from "../interfaces/agent";

export class Agent implements I_Agent {
	agent_id: string;
	ip: string;
	notes: string;

	constructor(
		agent_id: string,
		ip: string,
		notes: string
	) {
		this.agent_id = agent_id;
		this.ip = ip;
		this.notes = notes;
	}

	getAgentID(): string {
		return this.agent_id;
	}
	getIP(): string {
		return this.ip;
	}
	getNotes(): string {
		return this.notes!;
	}
	setNotes(notes: string): void {
		this.notes = notes;
	}
}
