import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Response } from "express";
import {
	type AuthenticatedUserRequest,
	restaurantOrStaffAuthMiddleware,
} from "@/presentation/http/middleware/restaurant-or-staff.auth.middleware.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("restaurantOrStaffAuthMiddleware", () => {
	let mockReq: Partial<AuthenticatedUserRequest>;
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

	it("should return 401 when x-user-id and x-restaurant-id headers are missing", () => {
		mockReq.headers = {
			"x-user-role": "restaurant_owner",
		};

		restaurantOrStaffAuthMiddleware(
			mockReq as AuthenticatedUserRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: HTTP_STATUS.UNAUTHORIZED,
				code: "UNAUTHORIZED",
				message: messages.GATEWAY_UNAUTHORIZED,
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 403 when x-user-role is missing", () => {
		mockReq.headers = {
			"x-user-id": "owner-123",
		};

		restaurantOrStaffAuthMiddleware(
			mockReq as AuthenticatedUserRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: HTTP_STATUS.FORBIDDEN,
				code: "FORBIDDEN",
				message: messages.FORBIDDEN,
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 403 when x-user-role is not in allowed roles list (e.g. customer)", () => {
		mockReq.headers = {
			"x-user-id": "user-123",
			"x-user-role": "customer",
		};

		restaurantOrStaffAuthMiddleware(
			mockReq as AuthenticatedUserRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: HTTP_STATUS.FORBIDDEN,
				code: "FORBIDDEN",
				message: messages.FORBIDDEN,
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 403 when req.params.restaurantId does not match x-restaurant-id", () => {
		mockReq.headers = {
			"x-user-id": "staff-123",
			"x-restaurant-id": "rest-123",
			"x-user-role": "staff",
		};
		mockReq.params = {
			restaurantId: "rest-999",
		};

		restaurantOrStaffAuthMiddleware(
			mockReq as AuthenticatedUserRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: HTTP_STATUS.FORBIDDEN,
				code: "FORBIDDEN",
				message: messages.RESTAURANT_ACCESS_FORBIDDEN,
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should authenticate staff member and call next()", () => {
		mockReq.headers = {
			"x-user-id": "staff-uuid-123",
			"x-user-role": "staff",
			"x-user-email": "staff@restaurant.com",
			"x-restaurant-id": "rest-uuid-456",
		};
		mockReq.params = {
			restaurantId: "rest-uuid-456",
		};

		restaurantOrStaffAuthMiddleware(
			mockReq as AuthenticatedUserRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "staff-uuid-123",
			restaurantId: "rest-uuid-456",
			email: "staff@restaurant.com",
			role: "staff",
		});
		expect(mockReq.userId).toBe("staff-uuid-123");
		expect(mockNext).toHaveBeenCalled();
	});

	it("should authenticate restaurant_owner and call next()", () => {
		mockReq.headers = {
			"x-user-id": "owner-uuid-123",
			"x-user-role": "restaurant_owner",
			"x-user-email": "owner@restaurant.com",
			"x-restaurant-id": "rest-uuid-456",
		};

		restaurantOrStaffAuthMiddleware(
			mockReq as AuthenticatedUserRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "owner-uuid-123",
			restaurantId: "rest-uuid-456",
			email: "owner@restaurant.com",
			role: "restaurant_owner",
		});
		expect(mockReq.userId).toBe("owner-uuid-123");
		expect(mockNext).toHaveBeenCalled();
	});
});
