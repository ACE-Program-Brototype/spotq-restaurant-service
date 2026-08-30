import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import { TYPES } from "@/di/types";
import { inject, injectable } from "inversify";
import type Redis from "ioredis";

@injectable()
export class RedisOtpStore implements IOtpStore {
	constructor(
		@inject(TYPES.Redis.Client)
		private readonly redis: Redis,
	) {}

	async save(
		key: string,
		otp: string,
		expiresInSeconds: number,
	): Promise<void> {
		await this.redis.set(key, otp, "EX", expiresInSeconds);
	}

	async get(key: string): Promise<string | null> {
		return this.redis.get(key);
	}

	async delete(key: string): Promise<void> {
		await this.redis.del(key);
	}

	async exists(key: string): Promise<boolean> {
		const result = await this.redis.exists(key);

		return result === 1;
	}

	async increment(key: string, ttlSeconds: number): Promise<number> {
		const attempts = await this.redis.incr(key);

		if (attempts === 1) {
			await this.redis.expire(key, ttlSeconds);
		}

		return attempts;
	}
}
