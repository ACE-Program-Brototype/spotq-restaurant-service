export class UnsupportedFileCategoryError extends Error {
	constructor(fileCategory: string) {
		super(`Unsupported file category: ${fileCategory}`);

		this.name = "UnsupportedFileCategoryError";
	}
}