import app from "@/app";
import {
	connectDatabase,
	disconnectDatabase,
} from "@/infrastructure/database/db";
import { logger } from "@/infrastructure/observability/logger";
import {
	connectBullMQ,
	disconnectBullMQ,
} from "@/infrastructure/queue/bullmq.connect";
import { connectRedis, disconnectRedis } from "@/infrastructure/redis/redis";
import { PORT } from "@/shared/constants/app.constants"

async function bootstrap() {
	try {
		await connectDatabase();
		await connectRedis();
		await connectBullMQ();

		const server = app.listen(PORT, () => {
			logger.info({ port: PORT }, "Server listening");
		});

		async function shutdown(signal: string) {
			logger.info({ signal }, "Shutdown requested");

			server.close(async () => {
				await disconnectRedis();
				await disconnectDatabase();
				await disconnectBullMQ();
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
