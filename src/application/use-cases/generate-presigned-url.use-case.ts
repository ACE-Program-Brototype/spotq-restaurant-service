import { inject, injectable } from "inversify";

import type { GeneratePresignedUrlDto } from "@/application/dto/generate-presigned-url.dto";
import type { IFilePolicyValidator } from "@/application/ports/services/file-policy-validator.port";
import type { IStorageService } from "@/application/ports/services/storage.service.port";
import type { IGeneratePresignedUrlUseCase } from "@/application/ports/use-case/generate-presigned-url.use-case.port";

import { env } from "@/config/env";
import { TYPES } from "@/di/types";

@injectable()
export class GeneratePresignedUrlUseCase
	implements IGeneratePresignedUrlUseCase
{
	constructor(
		@inject(TYPES.Services.FilePolicyValidator)
		private readonly filePolicyValidator: IFilePolicyValidator,

		@inject(TYPES.Services.Storage)
		private readonly storageService: IStorageService,
	) {}

	async execute(dto: GeneratePresignedUrlDto) {
		this.filePolicyValidator.validate({
			fileCategory: dto.file_category,
			contentType: dto.content_type,
			fileSize: dto.file_size,
		});

		const s3ObjectKey = this.generateS3ObjectKey(
			dto.onboarding_id,
			dto.file_category,
			dto.file_name,
		);

		const expiresInSeconds =
			env.AWS_S3_PRESIGNED_URL_EXPIRATION_SECONDS;

		const uploadUrl =
			await this.storageService.generatePresignedUploadUrl({
				key: s3ObjectKey,
				contentType: dto.content_type,
				expiresInSeconds,
			});

		return {
			uploadUrl,
			s3ObjectKey,
			expiresInSeconds,
		};
	}

	private generateS3ObjectKey(
		onboarding_id: string,
		fileCategory: string,
		fileName: string,
	): string {
		const sanitizedFileName = this.sanitizeFileName(fileName);
		const fileId = crypto.randomUUID();

		return `restaurants/${onboarding_id}/${fileCategory.toLowerCase()}/${fileId}_${sanitizedFileName}`;
	}

	private sanitizeFileName(fileName: string): string {
		const baseName = fileName.split(/[\\/]/).pop() ?? "file";

		return (
			baseName
				.replace(/[^a-zA-Z0-9._-]/g, "_")
				.replace(/\.{2,}/g, ".")
				.substring(0, 100) || "file"
		);
	}
}