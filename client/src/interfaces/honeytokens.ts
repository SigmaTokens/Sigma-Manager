export interface honeytokens {
	getTokenID(): string;
	getGroupID(): string;
	getType():honeytokens;
	getCreationDate(): Date;
	getExpirationDate(): Date;
	isExpired(): boolean;
	isTriggered(): boolean;
	getNotes(): string[];
}

interface HoneytokenManager {
	createTokens(token_type: honeytokens, numOfTokens: number): void;
	deleteTokens(groupID: string): void;
}

interface HoneytokenScatter {
	manualPlacement(tokens: honeytokens[], where: any): void;
	autoPlacement(tokens: honeytokens[]): void;
}
