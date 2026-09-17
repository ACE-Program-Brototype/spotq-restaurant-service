import { MAX_FILE_SIZE_BYTES } from "@shared/constants/storage.constants";
import { FileCategory } from "./file-category.enum";

export interface FilePolicy {
	allowedMimeTypes: string[];
	maxSizeBytes: number;
}

export const FILE_POLICIES: Record<FileCategory, FilePolicy> = {
	[FileCategory.DOCUMENTS]: {
		allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
		maxSizeBytes: MAX_FILE_SIZE_BYTES.DOCUMENTS,
	},

	[FileCategory.IMAGES]: {
		allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
		maxSizeBytes: MAX_FILE_SIZE_BYTES.IMAGES,
	},

	[FileCategory.PROFILE]: {
		allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
		maxSizeBytes: MAX_FILE_SIZE_BYTES.PROFILE,
	},

	[FileCategory.RECEIPTS]: {
		allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
		maxSizeBytes: MAX_FILE_SIZE_BYTES.RECEIPTS,
	},

	[FileCategory.MENUS]: {
		allowedMimeTypes: [
			"application/pdf",
			"image/jpeg",
			"image/png",
			"image/webp",
		],
		maxSizeBytes: MAX_FILE_SIZE_BYTES.MENUS,
	},
};
