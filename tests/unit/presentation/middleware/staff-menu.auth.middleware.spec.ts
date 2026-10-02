import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { staffMenuAuthMiddleware } from "@/presentation/http/middleware/staff-menu.auth.middleware.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("staffMenuAuthMiddleware", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: jest.MockedFunction<NextFunction>;

	const restaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

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

	it("should return 401 when identity headers and token are missing", () => {
		mockReq.headers = {
			"x-user-role": "staff",
		};

		staffMenuAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 401,
				code: "UNAUTHORIZED",
				message: messages.GATEWAY_UNAUTHORIZED,
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 403 when role is missing or invalid", () => {
		mockReq.headers = {
			"x-user-id": "user-123",
			"x-user-role": "customer",
		};

		staffMenuAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(403);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 403,
				code: "FORBIDDEN",
				message: messages.STAFF_FORBIDDEN,
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should return 403 when x-restaurant-id does not match req.params.restaurantId (tenant isolation)", () => {
		mockReq.headers = {
			"x-user-id": "staff-123",
			"x-user-role": "staff",
			"x-restaurant-id": "different-restaurant-id",
		};
		mockReq.params = { restaurantId };

		staffMenuAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(403);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 403,
				code: "FORBIDDEN",
				message: messages.RESTAURANT_ACCESS_FORBIDDEN,
			}),
		);
		expect(mockNext).not.toHaveBeenCalled();
	});

	it("should allow staff role and call next", () => {
		mockReq.headers = {
			"x-user-id": "staff-123",
			"x-user-role": "staff",
			"x-restaurant-id": restaurantId,
			"x-user-email": "staff@example.com",
		};
		mockReq.params = { restaurantId };

		staffMenuAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockNext).toHaveBeenCalled();
		expect(mockReq.user).toEqual({
			userId: "staff-123",
			restaurantId,
			email: "staff@example.com",
			role: "staff",
		});
	});

	it("should allow server, pos_terminal, kitchen_operator, and manager roles", () => {
		const allowedRoles = [
			"server",
			"kitchen_operator",
			"pos_terminal",
			"manager",
			"restaurant_admin",
			"restaurant_owner",
		];

		for (const role of allowedRoles) {
			const next = jest.fn();
			const req: Partial<Request> = {
				headers: {
					"x-user-id": `user-${role}`,
					"x-user-role": role,
					"x-restaurant-id": restaurantId,
				},
				params: { restaurantId },
			};
			const res: Partial<Response> = {
				status: jest.fn().mockReturnThis() as never,
				json: jest.fn().mockReturnThis() as never,
			};

			staffMenuAuthMiddleware(
				req as Request,
				res as Response,
				next as unknown as NextFunction,
			);

			expect(next).toHaveBeenCalled();
		}
	});

	it("should authenticate via Authorization Bearer JWT token when gateway headers are absent", () => {
		const tokenPayload = {
			userId: "staff-jwt-1",
			restaurantId,
			email: "jwt-staff@example.com",
			role: "staff",
		};
		const token = jwt.sign(tokenPayload, "secret");

		mockReq.headers = {
			authorization: `Bearer ${token}`,
		};
		mockReq.params = { restaurantId };

		staffMenuAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockNext).toHaveBeenCalled();
		expect(mockReq.user).toEqual(
			expect.objectContaining({
				userId: "staff-jwt-1",
				restaurantId,
				role: "staff",
			}),
		);
	});
});
