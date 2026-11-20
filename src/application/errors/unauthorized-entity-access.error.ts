import { DomainError } from "@/domain/errors/domain.error";

export class UnauthorizedEntityAccessError extends DomainError {
	public readonly code = "UnauthorizedEntityAccessError";

	constructor() {
		super("Unauthorized entity access");
	}
}
