import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env.ts";
import { customerOptionalAuthMiddleware } from "@/presentation/http/middleware/customer-optional-auth.middleware.ts";

describe("customerOptionalAuthMiddleware", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: jest.MockedFunction<NextFunction>;

	// Generate tokens using the RSA private key initialized in tests/setup.ts
	const signCustomerToken = (
		payload: Record<string, unknown>,
		options?: jwt.SignOptions,
	): string => {
		const privateKey = env.JWT_ACCESS_PRIVATE_KEY || env.JWT_PRIVATE_KEY;
		return jwt.sign(payload, privateKey, {
			algorithm: "RS256",
			expiresIn: "1h",
			...options,
		});
	};

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

	// =========================================================================
	// Scenario A: No Authorization Header (Guest Request)
	// =========================================================================
	describe("Scenario A: No Authorization Header", () => {
		it("should allow request to continue as guest when Authorization header is absent", () => {
			mockReq.headers = {};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockReq.userId).toBeUndefined();
			expect(mockReq.user).toBeUndefined();
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledWith();
			expect(mockRes.status).not.toHaveBeenCalled();
			expect(mockRes.json).not.toHaveBeenCalled();
		});
	});

	// =========================================================================
	// Scenario B: Valid Customer Access Token
	// =========================================================================
	describe("Scenario B: Valid Customer Access Token", () => {
		it("should authenticate customer with valid JWT and populate req.userId and req.user", () => {
			const token = signCustomerToken({
				sub: "cust-uuid-101",
				email: "customer@spotq.com",
				role: "CUSTOMER",
			});

			mockReq.headers = {
				authorization: `Bearer ${token}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

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

		it("should default role to 'CUSTOMER' when role claim is omitted in JWT", () => {
			const token = signCustomerToken({
				sub: "cust-uuid-102",
				email: "norole@spotq.com",
			});

			mockReq.headers = {
				authorization: `Bearer ${token}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockReq.userId).toBe("cust-uuid-102");
			expect(mockReq.user).toEqual({
				userId: "cust-uuid-102",
				email: "norole@spotq.com",
				role: "CUSTOMER",
			});
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledWith();
		});

		it("should default email to empty string when email claim is not a string", () => {
			const token = signCustomerToken({
				sub: "cust-uuid-103",
			});

			mockReq.headers = {
				authorization: `Bearer ${token}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockReq.userId).toBe("cust-uuid-103");
			expect(mockReq.user?.email).toBe("");
			expect(mockNext).toHaveBeenCalledTimes(1);
		});
	});

	// =========================================================================
	// Scenario C: Supported User ID Claims & Precedence
	// =========================================================================
	describe("Scenario C: Supported User ID Claims & Precedence", () => {
		it("should extract userId from 'sub' claim when present", () => {
			const token = signCustomerToken({
				sub: "sub-user-123",
				email: "sub@spotq.com",
			});

			mockReq.headers = {
				authorization: `Bearer ${token}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockReq.userId).toBe("sub-user-123");
			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should extract userId from 'id' claim when 'sub' is absent", () => {
			const token = signCustomerToken({
				id: "id-user-456",
				email: "id@spotq.com",
			});

			mockReq.headers = {
				authorization: `Bearer ${token}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockReq.userId).toBe("id-user-456");
			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should extract userId from 'userId' claim when both 'sub' and 'id' are absent", () => {
			const token = signCustomerToken({
				userId: "userid-user-789",
				email: "userid@spotq.com",
			});

			mockReq.headers = {
				authorization: `Bearer ${token}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockReq.userId).toBe("userid-user-789");
			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should prioritize 'sub' over 'id' and 'userId' when multiple claims are present", () => {
			const token = signCustomerToken({
				sub: "preferred-sub-id",
				id: "fallback-id",
				userId: "fallback-userid",
				email: "precedence@spotq.com",
			});

			mockReq.headers = {
				authorization: `Bearer ${token}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockReq.userId).toBe("preferred-sub-id");
			expect(mockNext).toHaveBeenCalledTimes(1);
		});

		it("should prioritize 'id' over 'userId' when 'sub' is missing", () => {
			const token = signCustomerToken({
				id: "preferred-id",
				userId: "fallback-userid",
				email: "precedence@spotq.com",
			});

			mockReq.headers = {
				authorization: `Bearer ${token}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockReq.userId).toBe("preferred-id");
			expect(mockNext).toHaveBeenCalledTimes(1);
		});
	});

	// =========================================================================
	// Scenario D: Invalid Authorization Format
	// =========================================================================
	describe("Scenario D: Invalid Authorization Format", () => {
		it("should return 401 when Authorization header does not use Bearer scheme", () => {
			mockReq.headers = {
				authorization: "Basic dXNlcjpwYXNz",
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: false,
				message: "Invalid authorization format",
				statusCode: 401,
			});
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 401 when Authorization header has token without 'Bearer ' prefix", () => {
			mockReq.headers = {
				authorization: "Token abc.def.ghi",
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: false,
				message: "Invalid authorization format",
				statusCode: 401,
			});
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	// =========================================================================
	// Scenario E: Empty Bearer Token
	// =========================================================================
	describe("Scenario E: Empty Bearer Token", () => {
		it("should return 401 when Authorization header is exactly 'Bearer'", () => {
			mockReq.headers = {
				authorization: "Bearer",
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: false,
				message: "Invalid authorization format",
				statusCode: 401,
			});
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 401 when Authorization header is 'Bearer ' with only whitespace", () => {
			mockReq.headers = {
				authorization: "Bearer    ",
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: false,
				message: "Access token is required",
				statusCode: 401,
			});
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	// =========================================================================
	// Scenario F: Invalid or Expired Token
	// =========================================================================
	describe("Scenario F: Invalid or Expired Token", () => {
		it("should return 401 when token has an invalid signature", () => {
			// Sign with an unrelated symmetric secret or mismatch key
			const foreignToken = jwt.sign(
				{ sub: "untrusted-user" },
				"different-secret-key",
				{ algorithm: "HS256" },
			);

			mockReq.headers = {
				authorization: `Bearer ${foreignToken}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: false,
				message: "Invalid or expired access token",
				statusCode: 401,
			});
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 401 when token is malformed", () => {
			mockReq.headers = {
				authorization: "Bearer this-is-not-a-valid-jwt-token",
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: false,
				message: "Invalid or expired access token",
				statusCode: 401,
			});
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 401 when token is expired", () => {
			const expiredToken = signCustomerToken(
				{ sub: "expired-user" },
				{ expiresIn: -10 }, // Expired 10 seconds ago
			);

			mockReq.headers = {
				authorization: `Bearer ${expiredToken}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: false,
				message: "Invalid or expired access token",
				statusCode: 401,
			});
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 401 when token is not yet valid (NotBeforeError)", () => {
			const notYetValidToken = signCustomerToken(
				{ sub: "future-user" },
				{ notBefore: "1h" }, // Valid 1 hour in the future
			);

			mockReq.headers = {
				authorization: `Bearer ${notYetValidToken}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: false,
				message: "Invalid or expired access token",
				statusCode: 401,
			});
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	// =========================================================================
	// Scenario G: Valid Token Without a Supported User ID
	// =========================================================================
	describe("Scenario G: Valid Token Without a Supported User ID", () => {
		it("should return 401 when token payload lacks sub, id, and userId", () => {
			const tokenWithoutUser = signCustomerToken({
				email: "nouser@spotq.com",
				role: "CUSTOMER",
			});

			mockReq.headers = {
				authorization: `Bearer ${tokenWithoutUser}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: false,
				message: "Invalid access token",
				statusCode: 401,
			});
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 401 when userId claim is empty string", () => {
			const tokenWithEmptySub = signCustomerToken({
				sub: "",
				email: "empty@spotq.com",
			});

			mockReq.headers = {
				authorization: `Bearer ${tokenWithEmptySub}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: false,
				message: "Invalid access token",
				statusCode: 401,
			});
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should return 401 when userId claim is a non-string type", () => {
			const tokenWithNumericSub = signCustomerToken({
				sub: 123456 as unknown as string,
			});

			mockReq.headers = {
				authorization: `Bearer ${tokenWithNumericSub}`,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: false,
				message: "Invalid access token",
				statusCode: 401,
			});
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	// =========================================================================
	// Scenario H: Missing JWT Public Key Configuration
	// =========================================================================
	describe("Scenario H: Missing JWT Public Key Configuration", () => {
		it("should pass error to next(error) when public key is not configured", () => {
			let isolatedMiddleware: typeof customerOptionalAuthMiddleware | undefined;

			jest.isolateModules(() => {
				jest.doMock("@config/env.ts", () => ({
					env: {
						JWT_PUBLIC_KEY: "",
						JWT_ACCESS_PUBLIC_KEY: "",
					},
				}));

				const mod = require("@/presentation/http/middleware/customer-optional-auth.middleware.ts");
				isolatedMiddleware = mod.customerOptionalAuthMiddleware;
			});

			const token = signCustomerToken({ sub: "any-user" });
			mockReq.headers = {
				authorization: `Bearer ${token}`,
			};

			if (isolatedMiddleware) {
				isolatedMiddleware(mockReq as Request, mockRes as Response, mockNext);
			}

			expect(mockNext).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "JWT public key is not configured",
				}),
			);
			expect(mockRes.status).not.toHaveBeenCalled();
			expect(mockReq.userId).toBeUndefined();
		});
	});

	// =========================================================================
	// Scenario I: Authorization Header Edge Cases
	// =========================================================================
	describe("Scenario I: Authorization Header Edge Cases", () => {
		it("should treat empty string Authorization header as guest request", () => {
			mockReq.headers = {
				authorization: "",
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockReq.userId).toBeUndefined();
			expect(mockReq.user).toBeUndefined();
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledWith();
			expect(mockRes.status).not.toHaveBeenCalled();
		});

		it("should handle array-valued Authorization header using the first entry", () => {
			const validToken = signCustomerToken({
				sub: "array-header-user",
				email: "array@spotq.com",
			});

			mockReq.headers = {
				authorization: [
					`Bearer ${validToken}`,
					"Bearer second-ignored-token",
				] as unknown as string,
			};

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockReq.userId).toBe("array-header-user");
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledWith();
		});

		it("should forward unexpected non-JWT errors to next(error)", () => {
			const validToken = signCustomerToken({ sub: "any-user" });
			mockReq.headers = {
				authorization: `Bearer ${validToken}`,
			};

			const unexpectedError = new Error("Unexpected memory failure");
			jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
				throw unexpectedError;
			});

			customerOptionalAuthMiddleware(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(unexpectedError);
			expect(mockRes.status).not.toHaveBeenCalled();
		});
	});
});
