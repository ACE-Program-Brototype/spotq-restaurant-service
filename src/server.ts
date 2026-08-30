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
import { createEmailWorker } from "@/infrastructure/queue/workers/email.worker";
import { connectRedis, disconnectRedis } from "@/infrastructure/redis/redis";
import { PORT } from "@/shared/constants/app.constants";
import { closeS3Client } from "@/infrastructure/storage/s3.client";
import { checkS3Connection } from "@/infrastructure/storage/s3.connect";
import { container } from "./di/container";
import { TYPES } from "./di/types";
import type { IEmailWorker } from "./application/ports/workers/email.worker.port";

async function bootstrap() {
	try {
		await connectDatabase();
		await connectRedis();
		await connectBullMQ();
		await checkS3Connection();

		const emailWorkerAdmin = container.get<IEmailWorker>(TYPES.Worker.EMAIL);
		emailWorkerAdmin.start();

		const emailWorkerStaff = createEmailWorker();

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
					await emailWorkerStaff.close();
					await emailWorkerAdmin.stop();
					await closeS3Client();

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
