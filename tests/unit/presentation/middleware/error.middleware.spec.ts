import type { Request, Response } from "express";
import { InvalidOtpError } from "@/application/errors/invalid-otp.error";
import {
	RestaurantAlreadyExistsError,
	RestaurantNotFoundError,
} from "@/domain/errors/restaurant.errors";
import { PersistenceError } from "@/infrastructure/errors/persistence.error";
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

	it("should map RestaurantAlreadyExistsError to status code 409", () => {
		const error = new RestaurantAlreadyExistsError();

		errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(409);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				statusCode: 409,
				code: "RESTAURANT_ALREADY_EXISTS",
				message: "Restaurant with this email already exists",
			}),
		);
	});

	it("should map RestaurantNotFoundError to status code 404", () => {
		const error = new RestaurantNotFoundError();

		errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

		expect(mockRes.status).toHaveBeenCalledWith(404);
		expect(mockRes.json).toHaveBeenCalledWith(
			expect.objectContaining({
				statusCode: 404,
				code: "RESTAURANT_NOT_FOUND",
			}),
		);
	});

	it("should map PersistenceError to 500 without leaking DB details to client", () => {
		const persistenceError = new PersistenceError(
			"Database connection crashed",
			{ query: "SELECT * FROM restaurants" },
		);

		errorHandler(
			persistenceError,
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(500);
		expect(mockRes.json).toHaveBeenCalledWith({
			success: false,
			statusCode: 500,
			code: "INTERNAL_SERVER_ERROR",
			message: "Internal server error occurred",
			error: undefined,
		});
	});
});
