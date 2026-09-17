import { type ConnectionOptions, Queue } from "bullmq";
import { env } from "@/config/env.ts";
import { QUEUE_NAMES } from "@/shared/constants/queue.constants";

const isTls = env.REDIS_URL.startsWith("rediss://");
const parsedUrl = new URL(env.REDIS_URL);

export const bullMQConnection: ConnectionOptions = {
	host: parsedUrl.hostname,
	port: Number(parsedUrl.port) || 6379,
	password: parsedUrl.password || undefined,
	username: parsedUrl.username || undefined,
	tls: isTls ? {} : undefined,
	maxRetriesPerRequest: null,
	enableReadyCheck: false,
};

export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, {
	connection: bullMQConnection,
});
