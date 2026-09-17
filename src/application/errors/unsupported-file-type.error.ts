import { DomainError } from "@/domain/errors/domain.error";
import type { FileCategory } from "@/shared/storage/file-category.enum";

export class UnsupportedFileTypeError extends DomainError {
	public readonly code = "UnsupportedFileTypeError";
	constructor(fileCategory: FileCategory, contentType: string) {
		super(
			`File type '${contentType}' is not supported for category '${fileCategory}'.`,
		);
	}
}
