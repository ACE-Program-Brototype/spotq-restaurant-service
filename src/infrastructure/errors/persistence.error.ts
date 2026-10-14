export class PersistenceError extends Error {
	public readonly code: string;
	public readonly originalError?: unknown;
	public readonly isRetryable: boolean;

	constructor(
		message = "Database operation failed",
		originalError?: unknown,
		code = "PERSISTENCE_ERROR",
		isRetryable = false,
	) {
		super(message);
		this.name = "PersistenceError";
		this.code = code;
		this.originalError = originalError;
		this.isRetryable = isRetryable;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
