import { DomainError } from "@/domain/errors/domain.error";

export class UnsupportedFileCategoryError extends DomainError {
	public readonly code = "UnsupportedFileCategoryError";

	constructor(fileCategory: string) {
		super(`Unsupported file category: ${fileCategory}`);
	}
}
