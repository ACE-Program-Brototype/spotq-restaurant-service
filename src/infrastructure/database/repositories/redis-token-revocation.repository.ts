import crypto from "node:crypto";
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
	private readonly keyPrefix = "auth:revoked-refresh:";

	constructor(
		@inject(TYPES.RedisClient)
		private readonly redis: Redis,
	) {}

	private hashToken(token: string): string {
		return crypto.createHash("sha256").update(token).digest("hex");
	}

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
			// Fallback to env default ttl
		}

		const key = `${this.keyPrefix}${this.hashToken(token)}`;
		await this.redis.set(key, "revoked", "EX", ttl);
	}

	public async isRevoked(token: string): Promise<boolean> {
		if (!token) {
			return false;
		}
		const key = `${this.keyPrefix}${this.hashToken(token)}`;
		const result = await this.redis.exists(key);
		return result === 1;
	}
}
