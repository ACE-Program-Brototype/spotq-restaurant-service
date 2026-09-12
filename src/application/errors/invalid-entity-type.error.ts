export class InvalidEntityTypeError extends Error {
	constructor() {
		super("Invalid entity_type");
		this.name = "InvalidEntityTypeError";
	}
}
