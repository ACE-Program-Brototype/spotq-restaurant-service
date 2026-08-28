import { inject, injectable } from "inversify";
import type { Redis } from "ioredis";
import jwt from "jsonwebtoken";
import { TYPES } from "@/config/di/types.ts";
import { env } from "@/config/env.ts";
import type { ITokenRevocationRepository } from "@/domain/repositories/token-revocation.repository.interface.ts";

@injectable()
export class RedisTokenRevocationRepository
	implements ITokenRevocationRepository
{
	constructor(
		@inject(TYPES.RedisClient)
		private readonly redis: Redis,
	) {}

	public async revoke(
		token: string,
		ttlSeconds = Math.floor(env.COOKIE_MAX_AGE_MS / 1000),
	): Promise<void> {
		if (!token) {
			return;
		}

		let ttl = ttlSeconds;
		try {
			const decoded = jwt.decode(token) as { exp?: number } | null;
			if (decoded?.exp) {
				const remaining = decoded.exp - Math.floor(Date.now() / 1000);
				if (remaining > 0) {
					ttl = remaining;
				}
			}
		} catch {
			// Fallback to default ttl
		}

		await this.redis.set(`revoked:token:${token}`, "revoked", "EX", ttl);
	}

	public async isRevoked(token: string): Promise<boolean> {
		if (!token) {
			return false;
		}
		const result = await this.redis.exists(`revoked:token:${token}`);
		return result === 1;
	}
}
