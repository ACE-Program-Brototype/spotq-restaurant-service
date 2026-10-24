import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import { generateToken } from "@spotq-org/s2s-core";
import { env } from "@/config/env.ts";
import { internalS2SAuthMiddleware } from "@/presentation/http/middleware/internal-s2s-auth.middleware.ts";

describe("internalS2SAuthMiddleware", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: jest.MockedFunction<NextFunction>;

	beforeEach(() => {
		mockReq = {
			headers: {},
			params: {},
		};
		mockRes = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};
		mockNext = jest.fn() as unknown as jest.MockedFunction<NextFunction>;
	});

	it("should return 401 when Authorization header is missing", () => {
		const middleware = internalS2SAuthMiddleware();
		middleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 401 when token is invalid or malformed", () => {
		mockReq.headers = {
			authorization: "Bearer invalid.token.value",
			"x-caller-service": "order-service",
		};

		const middleware = internalS2SAuthMiddleware();
		middleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should authenticate successfully with valid S2S token from order-service", () => {
		const token = generateToken("restaurant-service", {
			serviceName: "order-service",
			privateKey: env.JWT_PRIVATE_KEY,
		});

		mockReq.headers = {
			authorization: `Bearer ${token}`,
			"x-caller-service": "order-service",
		};

		const middleware = internalS2SAuthMiddleware();
		middleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockNext).toHaveBeenCalled();
	});
});
