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

	it("should return 401 when x-user-id header is missing", () => {
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

	it("should return 403 when x-user-role is missing", () => {
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

	it("should return 403 when x-user-role is not admin (e.g., staff or customer)", () => {
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

	it("should allow request and set req.user when role is 'admin'", () => {
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
		expect(mockNext).toHaveBeenCalled();
	});

	it("should allow request when role is 'super_admin' or 'ADMIN'", () => {
		mockReq.headers = {
			"x-user-id": "superadmin-uuid-1",
			"x-user-role": "SUPER_ADMIN",
			"x-user-email": "superadmin@spotq.com",
		};

		adminAuthMiddleware(
			mockReq as AuthenticatedAdminRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user).toEqual({
			userId: "superadmin-uuid-1",
			email: "superadmin@spotq.com",
			role: "SUPER_ADMIN",
		});
		expect(mockReq.userId).toBe("superadmin-uuid-1");
		expect(mockNext).toHaveBeenCalled();
	});
});
