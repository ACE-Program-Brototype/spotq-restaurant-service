import { DomainError } from "@/domain/errors/domain.error";
import type { FileCategory } from "@/shared/storage/file-category.enum";

export class FileSizeExceededError extends DomainError {
	public readonly code = "FileSizeExceededError";

	constructor(
		fileCategory: FileCategory,
		_fileSize: number,
		maxSizeBytes: number,
	) {
		super(
			`File size for category '${fileCategory}' exceeds the maximum allowed size of ${maxSizeBytes} bytes.`,
		);
	}
}
