import { type ConnectionOptions, Queue } from "bullmq";
import { env } from "@/config/env.ts";
import { QUEUE_CONFIG, QUEUE_NAMES } from "@/shared/constants/queue.constants";

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
	defaultJobOptions: {
		attempts: env.QUEUE_EMAIL_ATTEMPTS,
		backoff: {
			type: QUEUE_CONFIG.BACKOFF_TYPE,
			delay: env.QUEUE_EMAIL_BACKOFF_DELAY_MS,
		},
		removeOnComplete: QUEUE_CONFIG.REMOVE_ON_COMPLETE,
		removeOnFail: env.QUEUE_EMAIL_REMOVE_ON_FAIL,
	},
});
