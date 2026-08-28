import { logger } from "@/infrastructure/observability/logger.ts";
import { emailQueue } from "@/infrastructure/queue/email.queue.ts";

export async function connectBullMQ(): Promise<void> {
	await emailQueue.waitUntilReady();
	logger.info("BullMQ connected");
}

export async function disconnectBullMQ(): Promise<void> {
	await emailQueue.close();
	logger.info("BullMQ disconnected");
}
