import type { Request, Response } from "express";
import { InvalidOtpError } from "@/application/errors/invalid-otp.error";
import { errorHandler } from "@/presentation/http/middleware/error.middleware";

describe("error.middleware", () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: jest.Mock;

	beforeEach(() => {
		mockReq = {
			method: "POST",
			originalUrl: "/api/v1/restaurant/verify-email",
		};
		mockRes = {
			locals: { requestId: "req-1", correlationId: "corr-1" },
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		mockNext = jest.fn();
	});

	it("should map InvalidOtpError to status code 400 instead of 500", () => {
		const error = new InvalidOtpError();

		errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(400);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				statusCode: 400,
				code: "InvalidOtpError",
				message: "Invalid or expired OTP code",
			}),
		);
	});
});
