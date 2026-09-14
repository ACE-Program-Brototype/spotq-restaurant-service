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
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 403 when user role is staff", () => {
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
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 403 when user role is customer", () => {
		mockReq.headers = {
			"x-user-id": "user-123",
			"x-user-role": "customer",
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
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should populate user and call next() on valid owner headers", () => {
		mockReq.headers = {
			"x-user-id": "owner-123",
			"x-user-role": "RESTAURANT_OWNER",
			"x-user-email": "owner@restaurant.com",
			"x-restaurant-id": "res-123",
		};

		restaurantOwnerAuthMiddleware(
			mockReq as AuthenticatedOwnerRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockNext).toHaveBeenCalled();
		expect(mockReq.user).toEqual({
			userId: "owner-123",
			restaurantId: "res-123",
			email: "owner@restaurant.com",
			role: "RESTAURANT_OWNER",
		});
		expect(mockReq.userId).toBe("owner-123");
	});

	it("should handle array header values correctly", () => {
		mockReq.headers = {
			"x-user-id": ["owner-123", "extra-id"],
			"x-user-role": ["RESTAURANT_OWNER"],
			"x-user-email": ["owner@restaurant.com"],
			"x-restaurant-id": ["res-123"],
		};

		restaurantOwnerAuthMiddleware(
			mockReq as AuthenticatedOwnerRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockNext).toHaveBeenCalled();
		expect(mockReq.user).toEqual({
			userId: "owner-123",
			restaurantId: "res-123",
			email: "owner@restaurant.com",
			role: "RESTAURANT_OWNER",
		});
	});
});
