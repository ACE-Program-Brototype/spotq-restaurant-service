export class UnauthorizedEntityAccessError extends Error {
	constructor() {
		super("Unauthorized entity access");
		this.name = "UnauthorizedEntityAccessError";
	}
}
