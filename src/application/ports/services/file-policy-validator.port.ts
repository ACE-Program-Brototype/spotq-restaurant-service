import type { FileCategory } from "@/shared/storage/file-category.enum";

export interface IFilePolicyValidator {
	validate(params: {
		fileCategory: FileCategory;
		contentType: string;
		fileSize: number;
	}): void;
}
