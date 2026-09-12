export class InvalidEntityIdError extends Error {
	constructor() {
		super("Invalid entity_id");
		this.name = "InvalidEntityIdError";
	}
}
