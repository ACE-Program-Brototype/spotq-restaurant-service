import { env } from "@/config/env.ts";
import { logger } from "@/infrastructure/observability/logger.ts";
import { RabbitMQClient } from "@spotq-org/rabbitmq-client";

export const rabbitmqClient = new RabbitMQClient({
	url: env.RABBITMQ_URL,
	serviceName: env.SERVICE_NAME,
	logger,
	prefetchCount: env.RABBITMQ_PREFETCH_COUNT,
	dlqOptions: {
		enabled: true,
	},
});

export async function connectRabbitMQ(): Promise<void> {
	await rabbitmqClient.connect();
	logger.info("RabbitMQ connected successfully");
}

export async function disconnectRabbitMQ(): Promise<void> {
	await rabbitmqClient.close();
	logger.info("RabbitMQ disconnected successfully");
}

