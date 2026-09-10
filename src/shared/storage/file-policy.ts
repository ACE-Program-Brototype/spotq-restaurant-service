import { FileCategory } from "./file-category.enum";

export interface FilePolicy {
	allowedMimeTypes: string[];
	maxSizeBytes: number;
}

export const FILE_POLICIES: Record<FileCategory, FilePolicy> = {
	[FileCategory.DOCUMENTS]: {
		allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
		maxSizeBytes: 5 * 1024 * 1024,
	},

	[FileCategory.IMAGES]: {
		allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
		maxSizeBytes: 5 * 1024 * 1024,
	},

	[FileCategory.PROFILE]: {
		allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
		maxSizeBytes: 2 * 1024 * 1024,
	},

	[FileCategory.RECEIPTS]: {
		allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
		maxSizeBytes: 5 * 1024 * 1024,
	},

	[FileCategory.MENUS]: {
		allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
		maxSizeBytes: 10 * 1024 * 1024,
	},
};