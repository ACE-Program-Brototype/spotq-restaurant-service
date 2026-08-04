import { type ConnectionOptions, Queue } from "bullmq";

const bullMQConnection: ConnectionOptions = {
	url: process.env.REDIS_URL,
};

export const testQueue = new Queue("email", {
	connection: bullMQConnection,
});
