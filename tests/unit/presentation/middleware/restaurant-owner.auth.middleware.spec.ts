import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import { restaurantOwnerAuthMiddleware } from "@/presentation/http/middleware/restaurant-owner.auth.middleware.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("restaurantOwnerAuthMiddleware", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: jest.Mock;

	beforeEach(() => {
		req = {
			headers: {},
		};

		res = {
			status: jest.fn().mockReturnThis() as unknown as Response["status"],
			json: jest.fn().mockReturnThis() as unknown as Response["json"],
		};

		next = jest.fn();
	});

	it("should return 401 if x-user-id header is missing", () => {
		restaurantOwnerAuthMiddleware(
			req as Request,
			res as Response,
			next as unknown as NextFunction,
		);

		expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.GATEWAY_UNAUTHORIZED,
				statusCode: HTTP_STATUS.UNAUTHORIZED,
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 403 if role is not an allowed restaurant owner role", () => {
		req.headers = {
			"x-user-id": "user-123",
			"x-user-role": "staff",
		};

		restaurantOwnerAuthMiddleware(
			req as Request,
			res as Response,
			next as unknown as NextFunction,
		);

		expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.OWNER_FORBIDDEN,
				statusCode: HTTP_STATUS.FORBIDDEN,
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should call next() and attach user to req for valid restaurant owner", () => {
		req.headers = {
			"x-user-id": "owner-123",
			"x-user-role": "restaurant_owner",
			"x-user-email": "owner@example.com",
			"x-restaurant-id": "res-456",
		};

		restaurantOwnerAuthMiddleware(
			req as Request,
			res as Response,
			next as unknown as NextFunction,
		);

		expect(next).toHaveBeenCalled();
		expect(req.user).toEqual({
			userId: "owner-123",
			restaurantId: "res-456",
			email: "owner@example.com",
			role: "restaurant_owner",
		});
		expect(req.userId).toBe("owner-123");
	});

	it("should accept alternative allowed owner roles like owner or restaurant_admin", () => {
		req.headers = {
			"x-user-id": "owner-123",
			"x-user-role": "OWNER",
		};

		restaurantOwnerAuthMiddleware(
			req as Request,
			res as Response,
			next as unknown as NextFunction,
		);

		expect(next).toHaveBeenCalled();
		expect(req.userId).toBe("owner-123");
	});
});
