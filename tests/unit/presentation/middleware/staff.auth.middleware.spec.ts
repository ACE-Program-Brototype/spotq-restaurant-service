import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Response } from "express";
import {
	type AuthenticatedRequest,
	staffAuthMiddleware,
} from "@/presentation/http/middleware/staff.auth.middleware.ts";

describe("staffAuthMiddleware", () => {
	let mockReq: Partial<AuthenticatedRequest>;
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
		mockNext = jest.fn();
	});

	it("should return 401 when x-user-id header is missing", () => {
		mockReq.headers = {
			"x-user-role": "staff",
		};

		staffAuthMiddleware(
			mockReq as AuthenticatedRequest,
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

	it("should return 403 when x-user-role is missing", () => {
		mockReq.headers = {
			"x-user-id": "staff-123",
		};

		staffAuthMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(403);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 403,
				code: "FORBIDDEN",
				message: "Forbidden: Staff access required",
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 403 when x-user-role is not staff (e.g., admin or customer)", () => {
		mockReq.headers = {
			"x-user-id": "admin-123",
			"x-user-role": "admin",
		};

		staffAuthMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(403);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 403,
				code: "FORBIDDEN",
				message: "Forbidden: Staff access required",
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should set req.user and req.userId and call next when headers are valid (lowercase 'staff')", () => {
		mockReq.headers = {
			"x-user-id": "staff-uuid-123",
			"x-user-role": "staff",
			"x-user-email": "staff@example.com",
			"x-restaurant-id": "rest-uuid-456",
		};

		staffAuthMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "staff-uuid-123",
			restaurantId: "rest-uuid-456",
			email: "staff@example.com",
			role: "staff",
		});
		expect(mockReq.userId).toBe("staff-uuid-123");
		expect(mockNext).toHaveBeenCalled();
	});

	it("should set req.user and req.userId and call next when headers are valid (uppercase 'STAFF')", () => {
		mockReq.headers = {
			"x-user-id": "staff-uuid-123",
			"x-user-role": "STAFF",
			"x-user-email": "staff@example.com",
		};

		staffAuthMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "staff-uuid-123",
			restaurantId: "",
			email: "staff@example.com",
			role: "STAFF",
		});
		expect(mockReq.userId).toBe("staff-uuid-123");
		expect(mockNext).toHaveBeenCalled();
	});

	it("should handle array headers properly", () => {
		mockReq.headers = {
			"x-user-id": ["staff-uuid-123", "extra-id"],
			"x-user-role": ["STAFF"],
			"x-user-email": ["staff@example.com"],
		};

		staffAuthMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user?.userId).toBe("staff-uuid-123");
		expect(mockReq.userId).toBe("staff-uuid-123");
		expect(mockNext).toHaveBeenCalled();
	});
});
