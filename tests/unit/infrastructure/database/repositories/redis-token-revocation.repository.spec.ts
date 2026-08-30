import crypto from "node:crypto";
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

	it("should revoke token and store under auth:revoked-refresh:<sha256> in Redis with calculated expiration", async () => {
		const token = jwt.sign(
			{ id: "staff-123", email: "staff@spotq.com" },
			"secret",
			{ expiresIn: "1h" },
		);
		const expectedHash = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");

		redis.set.mockResolvedValue("OK" as never);

		await repository.revoke(token);

		expect(redis.set).toHaveBeenCalledWith(
			`auth:revoked-refresh:${expectedHash}`,
			"revoked",
			"EX",
			expect.any(Number),
		);
	});

	it("should return true when token hash is found in auth:revoked-refresh", async () => {
		const token = "revoked-token";
		const expectedHash = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");
		redis.exists.mockResolvedValue(1 as never);

		const isRevoked = await repository.isRevoked(token);

		expect(isRevoked).toBe(true);
		expect(redis.exists).toHaveBeenCalledWith(
			`auth:revoked-refresh:${expectedHash}`,
		);
	});

	it("should return false when token hash is not revoked", async () => {
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
