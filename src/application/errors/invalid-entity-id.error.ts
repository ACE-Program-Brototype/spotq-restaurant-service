import { DomainError } from "@/domain/errors/domain.error";

export class InvalidEntityIdError extends DomainError {
	public readonly code = "InvalidEntityIdError";

	constructor() {
		super("Invalid entity_id");
	}
}
