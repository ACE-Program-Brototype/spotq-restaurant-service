import { logger } from "@/infrastructure/observability/logger";
import { testQueue } from "@/infrastructure/queue/bullmq.service";

export async function connectBullMQ(): Promise<void> {
	await testQueue.waitUntilReady();
	logger.info("BullMQ connected");
}

export async function disconnectBullMQ(): Promise<void> {
	await testQueue.close();
	logger.info("BullMQ disconnected");
}
