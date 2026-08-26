import { type ConnectionOptions, Queue } from "bullmq";
import { env } from "@/config/env.ts";
import { QUEUE_NAMES } from "@/shared/constants/queue.constants";

const bullMQConnection: ConnectionOptions = {
	url: env.REDIS_URL,
};

export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, {
	connection: bullMQConnection,
});
