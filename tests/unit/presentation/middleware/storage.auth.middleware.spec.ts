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

	it("should return 401 when x-user-id header is missing", () => {
		storageAuthMiddleware(
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

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

	it("should populate user context and proceed when x-user-id is present", () => {
		mockReq.headers = {
			"x-user-id": "user-uuid-123",
			"x-user-role": "STAFF",
			"x-user-email": "staff@spotq.com",
			"x-restaurant-id": "rest-uuid-456",
		};

		storageAuthMiddleware(
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "user-uuid-123",
			role: "STAFF",
			email: "staff@spotq.com",
			restaurantId: "rest-uuid-456",
		});
		expect(mockReq.userId).toBe("user-uuid-123");
		expect(mockNext).toHaveBeenCalled();
	});
});
