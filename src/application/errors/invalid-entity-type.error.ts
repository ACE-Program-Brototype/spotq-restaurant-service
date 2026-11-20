import { DomainError } from "@/domain/errors/domain.error";

export class InvalidEntityTypeError extends DomainError {
	public readonly code = "InvalidEntityTypeError";

	constructor() {
		super("Invalid entity_type");
	}
}
