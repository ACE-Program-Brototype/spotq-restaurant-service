import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@infrastructure/storage/s3.client";
import { injectable } from "inversify";
import type {
	GeneratePresignedGetUrlInput,
	GeneratePresignedGetUrlResult,
	GeneratePresignedUploadUrlInput,
	GeneratePresignedUploadUrlResult,
	IStorageService,
} from "@/application/ports/services/storage.service.port";
import { env } from "@/config/env";
import { StorageOperationFailedError } from "@/domain/errors/storage.errors";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { messages } from "@/shared/constants/message.constants";
import { S3_ERROR_CODES } from "@/shared/constants/storage.constants";

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

	async deleteObject(key: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: env.AWS_S3_BUCKET,
			Key: key,
		});

		try {
			await s3Client.send(command);
		} catch (error: unknown) {
			const err = error as {
				name?: string;
				code?: string;
				$metadata?: { httpStatusCode?: number };
			};
			if (
				err?.name === S3_ERROR_CODES.NO_SUCH_KEY ||
				err?.code === S3_ERROR_CODES.NO_SUCH_KEY ||
				err?.$metadata?.httpStatusCode === HTTP_STATUS.NOT_FOUND
			) {
				return;
			}
			throw new StorageOperationFailedError(
				err?.name
					? `${messages.S3_OBJECT_DELETE_FAILED}: ${err.name}`
					: messages.S3_OBJECT_DELETE_FAILED,
			);
		}
	}
}
