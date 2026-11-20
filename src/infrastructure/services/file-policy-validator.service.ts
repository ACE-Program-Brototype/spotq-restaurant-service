import { FileSizeExceededError } from "@application/errors/file-size-exceeded.error";
import { UnsupportedFileCategoryError } from "@application/errors/unsupported-file-category.error";
import { UnsupportedFileTypeError } from "@application/errors/unsupported-file-type.error";
import { injectable } from "inversify";
import type { IFilePolicyValidator } from "@/application/ports/services/file-policy-validator.port";
import type { FileCategory } from "@/shared/storage/file-category.enum";
import { FILE_POLICIES } from "@/shared/storage/file-policy";

@injectable()
export class FilePolicyValidatorService implements IFilePolicyValidator {
	validate(params: {
		fileCategory: FileCategory;
		contentType: string;
		fileSize: number;
	}): void {
		const policy = FILE_POLICIES[params.fileCategory];

		if (!policy) {
			throw new UnsupportedFileCategoryError(params.fileCategory);
		}

		if (!policy.allowedMimeTypes.includes(params.contentType)) {
			throw new UnsupportedFileTypeError(
				params.fileCategory,
				params.contentType,
			);
		}

		if (params.fileSize > policy.maxSizeBytes) {
			throw new FileSizeExceededError(
				params.fileCategory,
				params.fileSize,
				policy.maxSizeBytes,
			);
		}
	}
}
