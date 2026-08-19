import app from "@/app.ts";
import {
	connectDatabase,
	disconnectDatabase,
} from "@/infrastructure/database/db.ts";
import { logger } from "@/infrastructure/observability/logger.ts";
import {
	connectBullMQ,
	disconnectBullMQ,
} from "@/infrastructure/queue/bullmq.connect.ts";
import { connectRedis, disconnectRedis } from "@/infrastructure/redis/redis.ts";
import { PORT } from "@/shared/constants/app.constants.ts";
import { closeS3Client } from "@/infrastructure/storage/s3.client";
import { checkS3Connection } from "@/infrastructure/storage/s3.connect";

async function bootstrap() {
	try {
		await connectDatabase();
		await connectRedis();
		await connectBullMQ();
		await checkS3Connection();

		const server = app.listen(PORT, () => {
			logger.info({ port: PORT }, "Server listening");
		});

		async function shutdown(signal: string) {
			logger.info({ signal }, "Shutdown requested");

			server.close(async () => {
				await disconnectRedis();
				await disconnectDatabase();
				await disconnectBullMQ();
				await closeS3Client();
				logger.info("Shutdown completed");
				process.exit(0);
			});
		}

		process.on("SIGINT", () => shutdown("SIGINT"));
		process.on("SIGTERM", () => shutdown("SIGTERM"));
	} catch (error) {
		logger.fatal({ err: error }, "Failed to start application");
		process.exit(1);
	}
}

bootstrap();
