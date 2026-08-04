import redis from "../../config/redis.js";


export async function connectRedis() {
    const redisResponse = await redis.ping();
    console.log("✅ Redis Connected:", redisResponse);
}

export async function disconnectRedis() {
    await redis.quit();
    console.log("Redis disconnected")
}