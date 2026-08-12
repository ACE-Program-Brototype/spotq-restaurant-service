import { type ConnectionOptions, Queue } from "bullmq";
import { env } from "@/config/env.js";

const bullMQConnection: ConnectionOptions = {
	url: env.REDIS_URL,
};

export const testQueue = new Queue("email", {
	connection: bullMQConnection,
});
