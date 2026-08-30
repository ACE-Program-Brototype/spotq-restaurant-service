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
import { createEmailWorker } from "@/infrastructure/queue/workers/email.worker.ts";
import { connectRedis, disconnectRedis } from "@/infrastructure/redis/redis.ts";
import { PORT } from "@/shared/constants/app.constants.ts";

async function bootstrap() {
	try {
		await connectDatabase();
		await connectRedis();
		await connectBullMQ();

		const emailWorker = createEmailWorker();

		const server = app.listen(PORT, () => {
			logger.info({ port: PORT }, "Server listening");
		});

		let isShuttingDown = false;

		async function shutdown(signal: string) {
			if (isShuttingDown) {
				return;
			}
			isShuttingDown = true;

			logger.info({ signal }, "Graceful shutdown initiated");

			// Close idle keep-alive connections
			if (typeof server.closeIdleConnections === "function") {
				server.closeIdleConnections();
			}

			server.close(async (err) => {
				if (err) {
					logger.error({ err }, "Error closing HTTP server");
				}

				try {
					await emailWorker.close();
					await disconnectBullMQ();
					await disconnectRedis();
					await disconnectDatabase();
					logger.info("Graceful shutdown completed successfully");
					process.exit(0);
				} catch (teardownErr) {
					logger.error({ err: teardownErr }, "Error during resource teardown");
					process.exit(1);
				}
			});

			// Force shutdown after 10s if connections fail to close
			setTimeout(() => {
				logger.error("Forced shutdown due to timeout");
				process.exit(1);
			}, 10000).unref();
		}

		process.on("SIGINT", () => shutdown("SIGINT"));
		process.on("SIGTERM", () => shutdown("SIGTERM"));
	} catch (error) {
		logger.fatal({ err: error }, "Failed to start application");
		process.exit(1);
	}
}

bootstrap();
