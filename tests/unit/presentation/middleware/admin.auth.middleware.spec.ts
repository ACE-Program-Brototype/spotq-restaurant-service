import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Response } from "express";
import {
	type AuthenticatedAdminRequest,
	adminAuthMiddleware,
} from "@/presentation/http/middleware/admin.auth.middleware.ts";

describe("adminAuthMiddleware", () => {
	let mockReq: Partial<AuthenticatedAdminRequest>;
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

	it("should return 401 when x-user-id header is missing (AC12)", () => {
		mockReq.headers = {
			"x-user-role": "admin",
		};

		adminAuthMiddleware(
			mockReq as AuthenticatedAdminRequest,
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

	it("should return 403 when x-user-role is missing (AC12)", () => {
		mockReq.headers = {
			"x-user-id": "admin-123",
		};

		adminAuthMiddleware(
			mockReq as AuthenticatedAdminRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(403);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 403,
				code: "FORBIDDEN",
				message: "Forbidden: Admin access required",
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 403 when x-user-role is not admin (e.g. staff or user)", () => {
		mockReq.headers = {
			"x-user-id": "user-123",
			"x-user-role": "staff",
		};

		adminAuthMiddleware(
			mockReq as AuthenticatedAdminRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(403);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 403,
				code: "FORBIDDEN",
				message: "Forbidden: Admin access required",
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should set user on request and call next when admin credentials are valid", () => {
		mockReq.headers = {
			"x-user-id": "admin-uuid-1",
			"x-user-role": "admin",
			"x-user-email": "admin@spotq.com",
		};

		adminAuthMiddleware(
			mockReq as AuthenticatedAdminRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "admin-uuid-1",
			email: "admin@spotq.com",
			role: "admin",
		});
		expect(mockReq.userId).toBe("admin-uuid-1");
		expect(mockNext).toHaveBeenCalledTimes(1);
	});

	it("should accept uppercase ADMIN role", () => {
		mockReq.headers = {
			"x-user-id": "admin-uuid-1",
			"x-user-role": "ADMIN",
			"x-user-email": "admin@spotq.com",
		};

		adminAuthMiddleware(
			mockReq as AuthenticatedAdminRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(mockReq.user?.role).toBe("ADMIN");
	});
});
