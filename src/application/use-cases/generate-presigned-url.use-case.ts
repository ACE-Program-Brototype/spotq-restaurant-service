import { inject, injectable } from "inversify";

import type {
	GeneratePresignedUrlDto,
	GeneratePresignedUrlResponseDto,
} from "@/application/dtos/restaurant/generate-presigned-url.dto";
import { InvalidEntityIdError } from "@/application/errors/invalid-entity-id.error";
import { InvalidEntityTypeError } from "@/application/errors/invalid-entity-type.error";
import { UnauthorizedEntityAccessError } from "@/application/errors/unauthorized-entity-access.error";
import type { IFilePolicyValidator } from "@/application/ports/services/file-policy-validator.port";
import type { IStorageService } from "@/application/ports/services/storage.service.port";
import type {
	AuthContext,
	IGeneratePresignedUrlUseCase,
} from "@/application/ports/use-cases/generate-presigned-url.use-case.port";

import { TYPES } from "@/config/di/types";
import { FileCategory } from "@/shared/storage/file-category.enum";

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

	async execute(
		dto: GeneratePresignedUrlDto,
		authContext?: AuthContext,
	): Promise<GeneratePresignedUrlResponseDto> {
		this.filePolicyValidator.validate({
			fileCategory: dto.file_category,
			contentType: dto.content_type,
			fileSize: dto.file_size,
		});

		const normalizedEntityType = this.sanitizeEntityType(dto.entity_type);
		const sanitizedEntityId = this.sanitizeEntityId(dto.entity_id);

		if (
			authContext?.restaurantId &&
			(normalizedEntityType === "restaurants" ||
				normalizedEntityType === "restaurant")
		) {
			if (authContext.restaurantId !== sanitizedEntityId) {
				throw new UnauthorizedEntityAccessError();
			}
		}

		const s3ObjectKey = this.generateS3ObjectKey(
			normalizedEntityType,
			sanitizedEntityId,
			dto.file_category,
			dto.file_name,
			authContext,
		);

		const { uploadUrl, expiresInSeconds } =
			await this.storageService.generatePresignedUploadUrl({
				key: s3ObjectKey,
				contentType: dto.content_type,
			});

		return {
			uploadUrl,
			s3ObjectKey,
			expiresInSeconds,
		};
	}

	private generateS3ObjectKey(
		entityType: string,
		entityId: string,
		fileCategory: string,
		fileName: string,
		authContext?: AuthContext,
	): string {
		if (fileCategory.toUpperCase() === FileCategory.PROFILE) {
			if (authContext?.role === "STAFF" || entityType === "staff") {
				const restaurantId =
					authContext?.restaurantId ||
					(entityType === "restaurants" || entityType === "restaurant"
						? entityId
						: "");
				const staffId =
					entityType === "staff" ? entityId : authContext?.userId || entityId;
				return `restaurants/${restaurantId}/staff/${staffId}/avatar.png`;
			}
			return `${entityType}/${entityId}/profile/avatar.png`;
		}

		const sanitizedFileName = this.sanitizeFileName(fileName);
		const fileId = crypto.randomUUID();

		return `${entityType}/${entityId}/${fileCategory.toLowerCase()}/${fileId}_${sanitizedFileName}`;
	}

	private sanitizeEntityType(entityType: string): string {
		const normalized = entityType.trim().toLowerCase();
		if (/[/\\.]/.test(normalized) || normalized.includes("..")) {
			throw new InvalidEntityTypeError();
		}
		return normalized.replace(/[^a-z0-9_-]/g, "");
	}

	private sanitizeEntityId(entityId: string): string {
		const trimmed = entityId.trim();
		if (/[/\\.]/.test(trimmed) || trimmed.includes("..")) {
			throw new InvalidEntityIdError();
		}
		return trimmed;
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
