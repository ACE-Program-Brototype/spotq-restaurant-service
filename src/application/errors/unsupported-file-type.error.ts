import type { FileCategory } from "@/shared/storage/file-category.enum";

export class UnsupportedFileTypeError extends Error {
	constructor(fileCategory: FileCategory, contentType: string) {
		super(
			`File type '${contentType}' is not supported for category '${fileCategory}'.`,
		);

		this.name = "UnsupportedFileTypeError";
	}
}
