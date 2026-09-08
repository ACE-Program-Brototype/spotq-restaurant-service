import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Response } from "express";
import {
	type AuthenticatedRequest,
	authMiddleware,
} from "@/presentation/http/middleware/auth.middleware.ts";

describe("authMiddleware alias", () => {
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

	it("should work as an alias for staffAuthMiddleware", () => {
		mockReq.headers = {
			"x-user-id": "staff-uuid-123",
			"x-user-role": "staff",
			"x-user-email": "staff@example.com",
		};

		authMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext,
		);

		expect(mockReq.user?.userId).toBe("staff-uuid-123");
		expect(mockReq.userId).toBe("staff-uuid-123");
		expect(mockNext).toHaveBeenCalled();
	});
});
