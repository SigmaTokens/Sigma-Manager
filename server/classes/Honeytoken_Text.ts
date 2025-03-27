import { HoneytokenType } from "../interfaces/type";
import { Honeytoken } from "./Honeytoken";
import { Monitor_Text } from "./Monitor_Text";

export class Honeytoken_Text extends Honeytoken {
	location: string;
	agent: Monitor_Text;

	constructor(token_id: string, group_id: string, type: HoneytokenType, location: string) {
		super(token_id, group_id, type);
		this.location = location;
		this.agent = new Monitor_Text(location);
	}

	startAgent(): void {
		this.agent.monitor();
	}

	createFile(): void {}
}
