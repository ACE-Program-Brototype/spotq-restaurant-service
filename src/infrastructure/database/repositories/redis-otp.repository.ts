import crypto from "node:crypto";
import { inject, injectable } from "inversify";
import type { Redis } from "ioredis";
import { TYPES } from "@/config/di/types.ts";
import type { IOtpRepository } from "@/domain/repositories/otp.repository.interface.ts";

@injectable()
export class RedisOtpRepository implements IOtpRepository {
	private readonly keyPrefix = "auth:otp:forgot-password:";

	constructor(
		@inject(TYPES.RedisClient)
		private readonly redis: Redis,
	) {}

	private formatKey(email: string): string {
		return `${this.keyPrefix}${email.trim().toLowerCase()}`;
	}

	private hashOtp(otp: string): string {
		return crypto.createHash("sha256").update(otp.trim()).digest("hex");
	}

	public async saveOtp(
		email: string,
		otp: string,
		ttlSeconds = 300,
	): Promise<void> {
		if (!email || !otp) {
			return;
		}
		const key = this.formatKey(email);
		const hashedOtp = this.hashOtp(otp);
		await this.redis.set(key, hashedOtp, "EX", ttlSeconds);
	}

	public async getOtp(email: string): Promise<string | null> {
		if (!email) {
			return null;
		}
		const key = this.formatKey(email);
		return this.redis.get(key);
	}

	public async verifyOtp(email: string, otp: string): Promise<boolean> {
		if (!email || !otp) {
			return false;
		}
		const storedHash = await this.getOtp(email);
		if (!storedHash) {
			return false;
		}

		const inputHash = this.hashOtp(otp);

		if (storedHash.length !== inputHash.length) {
			return false;
		}

		return crypto.timingSafeEqual(
			Buffer.from(storedHash),
			Buffer.from(inputHash),
		);
	}

	public async deleteOtp(email: string): Promise<void> {
		if (!email) {
			return;
		}
		const key = this.formatKey(email);
		await this.redis.del(key);
	}
}
