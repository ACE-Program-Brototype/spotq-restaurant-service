import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import { restaurantOwnerAuthMiddleware } from "@/presentation/http/middleware/restaurant-owner.auth.middleware.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("restaurantOwnerAuthMiddleware", () => {
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

	it("should call next() and populate req.user for valid owner headers", () => {
		mockReq.headers = {
			"x-user-id": "owner-123",
			"x-user-role": "restaurant_owner",
			"x-user-email": "owner@restaurant.com",
			"x-restaurant-id": "rest-456",
		};

		restaurantOwnerAuthMiddleware(
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(mockReq.user).toEqual({
			userId: "owner-123",
			restaurantId: "rest-456",
			email: "owner@restaurant.com",
			role: "restaurant_owner",
		});
		expect(mockReq.userId).toBe("owner-123");
	});

	it("should allow other permitted owner roles (e.g., owner, restaurant_admin)", () => {
		mockReq.headers = {
			"x-user-id": "owner-123",
			"x-user-role": "OWNER",
		};

		restaurantOwnerAuthMiddleware(
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

		expect(mockNext).toHaveBeenCalledTimes(1);
	});

	it("should return 401 UNAUTHORIZED when x-user-id header is missing", () => {
		mockReq.headers = {
			"x-user-role": "restaurant_owner",
		};

		restaurantOwnerAuthMiddleware(
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

		expect(mockNext).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.GATEWAY_UNAUTHORIZED,
				statusCode: HTTP_STATUS.UNAUTHORIZED,
			}),
		);
	});

	it("should return 403 FORBIDDEN when user role is missing or not an owner", () => {
		mockReq.headers = {
			"x-user-id": "user-123",
			"x-user-role": "customer",
		};

		restaurantOwnerAuthMiddleware(
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

		expect(mockNext).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.OWNER_FORBIDDEN,
				statusCode: HTTP_STATUS.FORBIDDEN,
			}),
		);
	});
});
