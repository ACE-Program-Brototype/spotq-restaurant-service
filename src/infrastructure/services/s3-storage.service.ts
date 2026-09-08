import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { injectable } from "inversify";

import type { IStorageService } from "@/application/ports/services/storage.service.port";
import { env } from "@/config/env";
import { s3Client } from "@infrastructure/storage/s3.client";


@injectable()
export class S3StorageService implements IStorageService {
	async generatePresignedUploadUrl(params: {
		key: string;
		contentType: string;
		expiresInSeconds: number;
	}): Promise<string> {
		const command = new PutObjectCommand({
			Bucket: env.AWS_S3_BUCKET,
			Key: params.key,
			ContentType: params.contentType,
		});

		return getSignedUrl(
			s3Client as unknown as Parameters<typeof getSignedUrl>[0],
			command,
			{
			expiresIn: params.expiresInSeconds,
			},
		);
	}
}