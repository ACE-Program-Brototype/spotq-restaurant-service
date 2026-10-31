import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import { customerOptionalAuthMiddleware } from "@/presentation/http/middleware/customer-optional-auth.middleware.ts";

describe("customerOptionalAuthMiddleware", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: jest.MockedFunction<NextFunction>;

	beforeEach(() => {
		mockReq = { headers: {} };
		mockRes = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		};
		mockNext = jest.fn() as unknown as jest.MockedFunction<NextFunction>;
	});

	it("continues as a guest when the user ID header is absent", () => {
		customerOptionalAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.userId).toBeUndefined();
		expect(mockReq.user).toBeUndefined();
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(mockNext).toHaveBeenCalledWith();
		expect(mockRes.status).not.toHaveBeenCalled();
		expect(mockRes.json).not.toHaveBeenCalled();
	});

	it("populates the request from customer identity headers", () => {
		mockReq.headers = {
			"x-user-id": "cust-uuid-101",
			"x-user-email": "customer@spotq.com",
			"x-user-role": "CUSTOMER",
		};

		customerOptionalAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.userId).toBe("cust-uuid-101");
		expect(mockReq.user).toEqual({
			userId: "cust-uuid-101",
			email: "customer@spotq.com",
			role: "CUSTOMER",
		});
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(mockNext).toHaveBeenCalledWith();
		expect(mockRes.status).not.toHaveBeenCalled();
		expect(mockRes.json).not.toHaveBeenCalled();
	});

	it("defaults the role to CUSTOMER and email to an empty string", () => {
		mockReq.headers = { "x-user-id": "cust-uuid-102" };

		customerOptionalAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.user).toEqual({
			userId: "cust-uuid-102",
			email: "",
			role: "CUSTOMER",
		});
		expect(mockNext).toHaveBeenCalledTimes(1);
	});

	it("uppercases a supplied role", () => {
		mockReq.headers = {
			"x-user-id": "staff-uuid-103",
			"x-user-role": "staff",
			"x-user-email": "staff@spotq.com",
		};

		customerOptionalAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.user?.role).toBe("STAFF");
		expect(mockNext).toHaveBeenCalledTimes(1);
	});

	it("uses the first value from array-valued identity headers", () => {
		mockReq.headers = {
			"x-user-id": ["first-user", "second-user"] as unknown as string,
			"x-user-email": ["first@spotq.com", "second@spotq.com"] as unknown as string,
			"x-user-role": ["customer", "staff"] as unknown as string,
		};

		customerOptionalAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.userId).toBe("first-user");
		expect(mockReq.user).toEqual({
			userId: "first-user",
			email: "first@spotq.com",
			role: "CUSTOMER",
		});
		expect(mockNext).toHaveBeenCalledTimes(1);
	});

	it("continues as a guest when the user ID header is empty", () => {
		mockReq.headers = { "x-user-id": "" };

		customerOptionalAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.userId).toBeUndefined();
		expect(mockReq.user).toBeUndefined();
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(mockRes.status).not.toHaveBeenCalled();
	});

	it("ignores Authorization headers because identity comes from the trusted user headers", () => {
		mockReq.headers = {
			authorization: "Bearer malformed-token",
		};

		customerOptionalAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

		expect(mockReq.userId).toBeUndefined();
		expect(mockReq.user).toBeUndefined();
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(mockRes.status).not.toHaveBeenCalled();
	});
});
