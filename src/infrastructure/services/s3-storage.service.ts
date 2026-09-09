import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { injectable } from "inversify";

import type {
	GeneratePresignedGetUrlInput,
	GeneratePresignedGetUrlResult,
	GeneratePresignedUploadUrlInput,
	GeneratePresignedUploadUrlResult,
	IStorageService,
} from "@/application/ports/services/storage.service.port";
import { env } from "@/config/env";
import { s3Client } from "@infrastructure/storage/s3.client";

@injectable()
export class S3StorageService implements IStorageService {
	async generatePresignedUploadUrl(
		params: GeneratePresignedUploadUrlInput,
	): Promise<GeneratePresignedUploadUrlResult> {
		const expiresInSeconds =
			params.expiresInSeconds ?? env.AWS_S3_PRESIGNED_URL_EXPIRATION_SECONDS;

		const command = new PutObjectCommand({
			Bucket: env.AWS_S3_BUCKET,
			Key: params.key,
			ContentType: params.contentType,
		});

		const uploadUrl = await getSignedUrl(
			s3Client as unknown as Parameters<typeof getSignedUrl>[0],
			command,
			{
				expiresIn: expiresInSeconds,
			},
		);

		return {
			uploadUrl,
			expiresInSeconds,
		};
	}

	async generatePresignedGetUrl(
		params: GeneratePresignedGetUrlInput,
	): Promise<GeneratePresignedGetUrlResult> {
		const expiresInSeconds =
			params.expiresInSeconds ?? env.AWS_S3_PRESIGNED_URL_EXPIRATION_SECONDS;

		const command = new GetObjectCommand({
			Bucket: env.AWS_S3_BUCKET,
			Key: params.key,
		});

		const downloadUrl = await getSignedUrl(
			s3Client as unknown as Parameters<typeof getSignedUrl>[0],
			command,
			{
				expiresIn: expiresInSeconds,
			},
		);

		return {
			downloadUrl,
			expiresInSeconds,
		};
	}
}