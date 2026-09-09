import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
	type AuthenticatedRequest,
	type AuthenticatedStaff,
	authMiddleware,
	authenticate,
} from "@/presentation/http/middleware/auth.middleware";

describe("auth.middleware authenticate", () => {
	let req: Request;
	let res: Response;
	let next: NextFunction;

	beforeEach(() => {
		req = {
			headers: {},
			cookies: {},
		} as Request;

		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		} as unknown as Response;

		next = jest.fn() as unknown as NextFunction;
	});

	it("returns 401 Unauthorized if token is missing", () => {
		authenticate(req as AuthenticatedRequest, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(next).not.toHaveBeenCalled();
	});

	it("returns 401 Unauthorized if Bearer token is invalid", () => {
		req.headers.authorization = "Bearer invalid-token";

		authenticate(req as AuthenticatedRequest, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(next).not.toHaveBeenCalled();
	});

	it("attaches decoded user payload and calls next() for valid Bearer token", () => {
		const payload = { restaurantId: "res-123", email: "owner@spotq.com" };
		jest.spyOn(jwt, "verify").mockReturnValue(payload as never);
		req.headers.authorization = "Bearer valid-token";

		authenticate(req as AuthenticatedRequest, res, next);

		expect((req as AuthenticatedRequest).user).toMatchObject(payload);
		expect(next).toHaveBeenCalled();
	});
});

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
		mockNext = jest.fn() as unknown as jest.MockedFunction<NextFunction>;
	});

	it("should work as an alias for staffAuthMiddleware", () => {
		mockReq.headers = {
			"x-user-id": "staff-uuid-123",
			"x-user-role": "staff",
			"x-user-email": "staff@example.com",
		};

		authMiddleware(
			mockReq as unknown as Request,
			mockRes as Response,
			mockNext,
		);

		expect((mockReq.user as AuthenticatedStaff)?.userId).toBe("staff-uuid-123");
		expect(mockReq.userId).toBe("staff-uuid-123");
		expect(mockNext).toHaveBeenCalled();
	});
});

