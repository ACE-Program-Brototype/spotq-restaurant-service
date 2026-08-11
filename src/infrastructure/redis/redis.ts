import redis from "@/config/redis";
import { logger } from "@/infrastructure/observability/logger";

export async function connectRedis() {
	const redisResponse = await redis.ping();
	logger.info({ response: redisResponse }, "Redis connected");
}

export async function disconnectRedis() {
	await redis.quit();
	logger.info("Redis disconnected");
}
