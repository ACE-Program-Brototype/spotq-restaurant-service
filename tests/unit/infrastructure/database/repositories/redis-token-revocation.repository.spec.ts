import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Redis } from "ioredis";
import jwt from "jsonwebtoken";
import { RedisTokenRevocationRepository } from "@/infrastructure/database/repositories/redis-token-revocation.repository.ts";

describe("RedisTokenRevocationRepository", () => {
	let redis: {
		set: ReturnType<typeof jest.fn>;
		exists: ReturnType<typeof jest.fn>;
	};
	let repository: RedisTokenRevocationRepository;

	beforeEach(() => {
		redis = {
			set: jest.fn(),
			exists: jest.fn(),
		};

		repository = new RedisTokenRevocationRepository(redis as unknown as Redis);
	});

	it("should revoke token and store in Redis with calculated expiration", async () => {
		const token = jwt.sign(
			{ id: "staff-123", email: "staff@spotq.com" },
			"secret",
			{ expiresIn: "1h" },
		);

		redis.set.mockResolvedValue("OK" as never);

		await repository.revoke(token);

		expect(redis.set).toHaveBeenCalledWith(
			`revoked:token:${token}`,
			"revoked",
			"EX",
			expect.any(Number),
		);
	});

	it("should return true when token is revoked in Redis", async () => {
		redis.exists.mockResolvedValue(1 as never);

		const isRevoked = await repository.isRevoked("revoked-token");

		expect(isRevoked).toBe(true);
		expect(redis.exists).toHaveBeenCalledWith(
			"revoked:token:revoked-token",
		);
	});

	it("should return false when token is not revoked", async () => {
		redis.exists.mockResolvedValue(0 as never);

		const isRevoked = await repository.isRevoked("valid-token");

		expect(isRevoked).toBe(false);
	});

	it("should handle empty or null token gracefully", async () => {
		await repository.revoke("");
		expect(redis.set).not.toHaveBeenCalled();

		const result = await repository.isRevoked("");
		expect(result).toBe(false);
	});
});
