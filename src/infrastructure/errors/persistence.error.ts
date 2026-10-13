export class PersistenceError extends Error {
	public readonly code: string;
	public readonly originalError?: unknown;

	constructor(
		message = "Database operation failed",
		originalError?: unknown,
		code = "PERSISTENCE_ERROR",
	) {
		super(message);
		this.name = "PersistenceError";
		this.code = code;
		this.originalError = originalError;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
