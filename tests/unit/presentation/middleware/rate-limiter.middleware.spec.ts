import type { Request, Response } from "express";
import redis from "@/config/redis.ts";
import { RateLimitExceededError } from "@/domain/errors/staff.errors.ts";
import {
	createRateLimiter,
	emailKeyGenerator,
	emailOrIpKeyGenerator,
	getClientIp,
	loginRateLimiter,
} from "@/presentation/middleware/rate-limiter.middleware.ts";

jest.mock("@/config/redis.ts", () => ({
	__esModule: true,
	default: {
		incr: jest.fn(),
		expire: jest.fn(),
		ttl: jest.fn(),
	},
}));

describe("Rate Limiter Middleware", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		mockReq = {
			body: {},
			headers: {},
			ip: "192.168.1.1",
			socket: { remoteAddress: "192.168.1.1" } as Request["socket"],
		};
		mockRes = {
			setHeader: jest.fn(),
		};
		mockNext = jest.fn();
	});

	describe("getClientIp", () => {
		it("should extract client IP from x-forwarded-for header when single IP", () => {
			mockReq.headers = { "x-forwarded-for": "203.0.113.195" };
			const ip = getClientIp(mockReq as Request);
			expect(ip).toBe("203.0.113.195");
		});

		it("should extract first client IP from x-forwarded-for header when comma separated", () => {
			mockReq.headers = {
				"x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
			};
			const ip = getClientIp(mockReq as Request);
			expect(ip).toBe("203.0.113.195");
		});

		it("should fallback to req.ip if x-forwarded-for is missing", () => {
			mockReq.headers = {};
			mockReq.ip = "10.0.0.1";
			const ip = getClientIp(mockReq as Request);
			expect(ip).toBe("10.0.0.1");
		});
	});

	describe("emailOrIpKeyGenerator & emailKeyGenerator", () => {
		it("should return email:ip when email is provided", () => {
			mockReq.body = { email: "STAFF@EXAMPLE.COM" };
			mockReq.ip = "127.0.0.1";
			const key = emailOrIpKeyGenerator(mockReq as Request);
			expect(key).toBe("staff@example.com:127.0.0.1");
		});

		it("should fallback to ip when email is missing in emailOrIpKeyGenerator", () => {
			mockReq.body = {};
			mockReq.ip = "127.0.0.1";
			const key = emailOrIpKeyGenerator(mockReq as Request);
			expect(key).toBe("127.0.0.1");
		});

		it("should return normalized email in emailKeyGenerator", () => {
			mockReq.body = { email: "  USER@EXAMPLE.COM " };
			const key = emailKeyGenerator(mockReq as Request);
			expect(key).toBe("user@example.com");
		});
	});

	describe("createRateLimiter execution", () => {
		const testLimiter = createRateLimiter({
			prefix: "test",
			maxAttempts: 3,
			windowSeconds: 60,
		});

		it("should allow request on first attempt and set Redis TTL and response headers", async () => {
			(redis.incr as jest.Mock).mockResolvedValue(1);
			(redis.ttl as jest.Mock).mockResolvedValue(59);

			await testLimiter(mockReq as Request, mockRes as Response, mockNext);

			expect(redis.incr).toHaveBeenCalledWith("ratelimit:test:192.168.1.1");
			expect(redis.expire).toHaveBeenCalledWith(
				"ratelimit:test:192.168.1.1",
				60,
			);
			expect(mockRes.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 3);
			expect(mockRes.setHeader).toHaveBeenCalledWith(
				"X-RateLimit-Remaining",
				2,
			);
			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should allow subsequent requests within limit without resetting expire", async () => {
			(redis.incr as jest.Mock).mockResolvedValue(2);
			(redis.ttl as jest.Mock).mockResolvedValue(45);

			await testLimiter(mockReq as Request, mockRes as Response, mockNext);

			expect(redis.expire).not.toHaveBeenCalled();
			expect(mockRes.setHeader).toHaveBeenCalledWith(
				"X-RateLimit-Remaining",
				1,
			);
			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should throw RateLimitExceededError and set Retry-After header when limit exceeded", async () => {
			(redis.incr as jest.Mock).mockResolvedValue(4);
			(redis.ttl as jest.Mock).mockResolvedValue(40);

			await expect(
				testLimiter(mockReq as Request, mockRes as Response, mockNext),
			).rejects.toThrow(RateLimitExceededError);

			expect(mockRes.setHeader).toHaveBeenCalledWith("Retry-After", 40);
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	describe("loginRateLimiter", () => {
		it("should block after 5 failed login attempts", async () => {
			mockReq.body = { email: "staff@example.com" };
			(redis.incr as jest.Mock).mockResolvedValue(6);
			(redis.ttl as jest.Mock).mockResolvedValue(600);

			await expect(
				loginRateLimiter(mockReq as Request, mockRes as Response, mockNext),
			).rejects.toThrow(
				"Too many login attempts. Please try again after 15 minutes.",
			);
		});
	});
});
