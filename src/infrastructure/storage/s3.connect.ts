import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { env } from "@/config/env";
import { s3Client } from "./s3.client";
import { logger } from "@/infrastructure/observability/logger";


export const checkS3Connection = async (): Promise<void> => {
	try {
		await s3Client.send(
			new HeadBucketCommand({
				Bucket: env.AWS_S3_BUCKET,
			}),
		);

		logger.info(
			{
				bucket: env.AWS_S3_BUCKET,
				region: env.AWS_REGION,
			},
			"S3 connection verified",
		);
	} catch (error) {
		logger.error(
			{
				bucket: env.AWS_S3_BUCKET,
				region: env.AWS_REGION,
				error,
			},
			"S3 connection verification failed",
		);

		throw error;
	}
};