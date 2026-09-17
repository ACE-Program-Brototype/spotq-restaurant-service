import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { restaurantAuthMiddleware } from "@/presentation/http/middleware/restaurant.auth.middleware.ts";

describe("restaurantAuthMiddleware", () => {
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

	it("should return 401 when no headers, params, or Bearer token are provided", () => {
		restaurantAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 401,
				code: "UNAUTHORIZED",
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should authenticate using x-restaurant-id header", () => {
		mockReq.headers = {
			"x-restaurant-id": "rest-uuid-123",
			"x-user-id": "user-uuid-456",
			"x-user-role": "RESTAURANT",
			"x-user-email": "owner@restaurant.com",
		};

		restaurantAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.userId).toBe("rest-uuid-123");
		expect(mockReq.user).toEqual({
			restaurantId: "rest-uuid-123",
			userId: "user-uuid-456",
			email: "owner@restaurant.com",
			role: "RESTAURANT",
		});
		expect(mockNext).toHaveBeenCalled();
	});

	it("should authenticate using route parameters (id or restaurantId)", () => {
		mockReq.params = {
			id: "param-rest-id-789",
		};

		restaurantAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.userId).toBe("param-rest-id-789");
		expect(mockReq.user).toEqual({
			restaurantId: "param-rest-id-789",
			userId: "param-rest-id-789",
			email: "",
			role: "RESTAURANT",
		});
		expect(mockNext).toHaveBeenCalled();
	});

	it("should handle array route parameters gracefully", () => {
		mockReq.params = {
			restaurantId: ["arr-rest-id-1", "arr-rest-id-2"] as unknown as string,
		};

		restaurantAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.userId).toBe("arr-rest-id-1");
		expect(mockNext).toHaveBeenCalled();
	});

	it("should fallback to decoding Bearer JWT token when Gateway headers are absent", () => {
		const tokenPayload = {
			restaurantId: "jwt-rest-id-999",
			sub: "jwt-user-id-888",
			email: "jwt@restaurant.com",
			role: "RESTAURANT",
		};
		const token = jwt.sign(tokenPayload, "secret-key");

		mockReq.headers = {
			authorization: `Bearer ${token}`,
		};

		restaurantAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.userId).toBe("jwt-rest-id-999");
		expect(mockReq.user).toEqual({
			restaurantId: "jwt-rest-id-999",
			userId: "jwt-user-id-888",
			email: "jwt@restaurant.com",
			role: "RESTAURANT",
		});
		expect(mockNext).toHaveBeenCalled();
	});

	it("should return 401 when Bearer token decoding fails", () => {
		mockReq.headers = {
			authorization: "Bearer invalid-malformed-token",
		};

		restaurantAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockNext).not.toHaveBeenCalled();
	});
});
