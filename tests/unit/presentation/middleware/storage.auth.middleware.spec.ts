import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import { storageAuthMiddleware } from "@/presentation/http/middleware/storage.auth.middleware.ts";

describe("storageAuthMiddleware", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: jest.MockedFunction<NextFunction>;

	beforeEach(() => {
		mockReq = {
			headers: {},
		};
		mockRes = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};
		mockNext = jest.fn() as unknown as jest.MockedFunction<NextFunction>;
	});

	it("should return 401 when both x-user-id and x-user-role headers are missing", () => {
		mockReq.headers = {};

		storageAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 401,
				code: "UNAUTHORIZED",
				message: "Unauthorized request from gateway",
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should allow request and call next when x-user-id is present", () => {
		mockReq.headers = {
			"x-user-id": "user-uuid-1",
			"x-user-role": "staff",
			"x-user-email": "staff@restaurant.com",
			"x-restaurant-id": "res-123",
		};

		storageAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.userId).toBe("user-uuid-1");
		expect(mockReq.user).toEqual({
			userId: "user-uuid-1",
			restaurantId: "res-123",
			email: "staff@restaurant.com",
			role: "staff",
		});
		expect(mockNext).toHaveBeenCalledTimes(1);
	});

	it("should allow request and call next when x-user-role is present without x-user-id", () => {
		mockReq.headers = {
			"x-user-role": "admin",
		};

		storageAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockNext).toHaveBeenCalledTimes(1);
	});
});
