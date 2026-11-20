import crypto from "node:crypto";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Redis } from "ioredis";
import { RedisOtpRepository } from "@/infrastructure/database/repositories/redis-otp.repository.ts";

describe("RedisOtpRepository", () => {
	let redis: {
		set: ReturnType<typeof jest.fn>;
		get: ReturnType<typeof jest.fn>;
		del: ReturnType<typeof jest.fn>;
	};
	let repository: RedisOtpRepository;

	beforeEach(() => {
		redis = {
			set: jest.fn(),
			get: jest.fn(),
			del: jest.fn(),
		};

		repository = new RedisOtpRepository(redis as unknown as Redis);
	});

	it("should save SHA-256 hashed OTP in Redis with TTL", async () => {
		redis.set.mockResolvedValue("OK" as never);

		await repository.saveOtp("  Staff@SpotQ.COM ", "123456", 300);

		const expectedHash = crypto
			.createHash("sha256")
			.update("123456")
			.digest("hex");

		expect(redis.set).toHaveBeenCalledWith(
			"auth:otp:forgot-password:staff@spotq.com",
			expectedHash,
			"EX",
			300,
		);
	});

	it("should verify correct OTP against stored hash using timingSafeEqual", async () => {
		const expectedHash = crypto
			.createHash("sha256")
			.update("123456")
			.digest("hex");

		redis.get.mockResolvedValue(expectedHash as never);

		const isValid = await repository.verifyOtp("staff@spotq.com", "123456");
		expect(isValid).toBe(true);

		const isInvalid = await repository.verifyOtp("staff@spotq.com", "654321");
		expect(isInvalid).toBe(false);
	});

	it("should return false if OTP is not found in Redis", async () => {
		redis.get.mockResolvedValue(null as never);

		const isValid = await repository.verifyOtp("staff@spotq.com", "123456");
		expect(isValid).toBe(false);
	});

	it("should delete OTP from Redis", async () => {
		redis.del.mockResolvedValue(1 as never);

		await repository.deleteOtp("staff@spotq.com");

		expect(redis.del).toHaveBeenCalledWith(
			"auth:otp:forgot-password:staff@spotq.com",
		);
	});
});
