import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Response } from "express";
import {
	type AuthenticatedOwnerRequest,
	restaurantOwnerAuthMiddleware,
} from "@/presentation/http/middleware/restaurant-owner.auth.middleware.ts";

describe("restaurantOwnerAuthMiddleware", () => {
	let mockReq: Partial<AuthenticatedOwnerRequest>;
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
		mockReq.headers = {
			"x-user-role": "restaurant_owner",
		};

		restaurantOwnerAuthMiddleware(
			mockReq as AuthenticatedOwnerRequest,
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

	it("should authenticate and call next() when x-user-role is missing but x-user-id is present", () => {
		mockReq.headers = {
			"x-user-id": "owner-123",
		};

		restaurantOwnerAuthMiddleware(
			mockReq as AuthenticatedOwnerRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "owner-123",
			restaurantId: "",
			email: "",
			role: "RESTAURANT_OWNER",
		});

		expect(mockReq.userId).toBe("owner-123");
		expect(mockNext).toHaveBeenCalled();
	});

	it("should return 403 when x-user-role is not an owner role (e.g. staff or customer)", () => {
		mockReq.headers = {
			"x-user-id": "user-123",
			"x-user-role": "staff",
		};

		restaurantOwnerAuthMiddleware(
			mockReq as AuthenticatedOwnerRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(403);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 403,
				code: "FORBIDDEN",
				message: "Forbidden: Restaurant owner access required",
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should authenticate restaurant_admin and call next()", () => {
		mockReq.headers = {
			"x-user-id": "owner-uuid-123",
			"x-user-role": "restaurant_admin",
			"x-user-email": "owner@restaurant.com",
			"x-restaurant-id": "rest-uuid-456",
		};

		restaurantOwnerAuthMiddleware(
			mockReq as AuthenticatedOwnerRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "owner-uuid-123",
			restaurantId: "rest-uuid-456",
			email: "owner@restaurant.com",
			role: "restaurant_admin",
		});
		expect(mockReq.userId).toBe("owner-uuid-123");
		expect(mockNext).toHaveBeenCalled();
	});

	it("should authenticate RESTAURANT_OWNER and call next()", () => {
		mockReq.headers = {
			"x-user-id": "owner-uuid-123",
			"x-user-role": "RESTAURANT_OWNER",
			"x-user-email": "owner@restaurant.com",
		};

		restaurantOwnerAuthMiddleware(
			mockReq as AuthenticatedOwnerRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "owner-uuid-123",
			restaurantId: "",
			email: "owner@restaurant.com",
			role: "RESTAURANT_OWNER",
		});
		expect(mockReq.userId).toBe("owner-uuid-123");
		expect(mockNext).toHaveBeenCalled();
	});

	it("should handle array headers properly", () => {
		mockReq.headers = {
			"x-user-id": ["owner-uuid-123", "extra-id"],
			"x-user-role": ["owner"],
			"x-user-email": ["owner@restaurant.com"],
		};

		restaurantOwnerAuthMiddleware(
			mockReq as AuthenticatedOwnerRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user?.userId).toBe("owner-uuid-123");
		expect(mockReq.userId).toBe("owner-uuid-123");
		expect(mockNext).toHaveBeenCalled();
	});
});
