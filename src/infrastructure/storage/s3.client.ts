import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../../config/env";

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const closeS3Client = async (): Promise<void> => {
	const handler = s3Client.config.requestHandler;

	if ("destroy" in handler && typeof handler.destroy === "function") {
		handler.destroy();
	}
};