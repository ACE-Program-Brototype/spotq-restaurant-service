import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import {
	type AuthenticatedOwnerRequest,
	restaurantOwnerAuthMiddleware,
} from "@/presentation/http/middleware/restaurant-owner.auth.middleware.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("restaurantOwnerAuthMiddleware", () => {
	let mockRequest: Partial<AuthenticatedOwnerRequest>;
	let mockResponse: Partial<Response>;
	let nextFunction: jest.MockedFunction<NextFunction>;

	beforeEach(() => {
		mockRequest = {
			headers: {},
		};
		mockResponse = {
			status: jest.fn().mockReturnThis() as unknown as Response["status"],
			json: jest.fn().mockReturnThis() as unknown as Response["json"],
		};
		nextFunction = jest.fn() as unknown as jest.MockedFunction<NextFunction>;
	});

	it("should return 401 when both x-restaurant-id and x-user-id headers are missing", () => {
		restaurantOwnerAuthMiddleware(
			mockRequest as Request,
			mockResponse as Response,
			nextFunction,
		);

		expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
		expect(mockResponse.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.GATEWAY_UNAUTHORIZED,
				statusCode: HTTP_STATUS.UNAUTHORIZED,
			}),
		);
		expect(nextFunction).not.toHaveBeenCalled();
	});

	it("should return 403 when x-user-role header is missing or not an owner role", () => {
		mockRequest.headers = {
			"x-restaurant-id": "rest-123",
			"x-user-role": "staff",
		};

		restaurantOwnerAuthMiddleware(
			mockRequest as Request,
			mockResponse as Response,
			nextFunction,
		);

		expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(mockResponse.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.YOU_DO_NOT_HAVE_PERMISSION,
				statusCode: HTTP_STATUS.FORBIDDEN,
			}),
		);
		expect(nextFunction).not.toHaveBeenCalled();
	});

	it("should return 403 when req.params.restaurantId does not match x-restaurant-id", () => {
		mockRequest.headers = {
			"x-restaurant-id": "rest-123",
			"x-user-role": "RESTAURANT_OWNER",
		};
		mockRequest.params = {
			restaurantId: "rest-999",
		};

		restaurantOwnerAuthMiddleware(
			mockRequest as Request,
			mockResponse as Response,
			nextFunction,
		);

		expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
		expect(mockResponse.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: messages.YOU_DO_NOT_HAVE_PERMISSION,
				statusCode: HTTP_STATUS.FORBIDDEN,
			}),
		);
		expect(nextFunction).not.toHaveBeenCalled();
	});

	it("should pass authentication with x-restaurant-id and x-user-role without x-user-id", () => {
		mockRequest.headers = {
			"x-restaurant-id": "rest-123",
			"x-user-role": "RESTAURANT_OWNER",
		};
		mockRequest.params = {
			restaurantId: "rest-123",
		};

		restaurantOwnerAuthMiddleware(
			mockRequest as Request,
			mockResponse as Response,
			nextFunction,
		);

		expect(nextFunction).toHaveBeenCalled();
		expect(mockRequest.user).toEqual({
			userId: "rest-123",
			role: "RESTAURANT_OWNER",
			email: "",
			restaurantId: "rest-123",
		});
	});

	it("should pass authentication and set req.user when user has owner role and x-user-id", () => {
		mockRequest.headers = {
			"x-user-id": "owner-123",
			"x-user-role": "RESTAURANT_OWNER",
			"x-user-email": "owner@example.com",
			"x-restaurant-id": "rest-123",
		};

		restaurantOwnerAuthMiddleware(
			mockRequest as Request,
			mockResponse as Response,
			nextFunction,
		);

		expect(nextFunction).toHaveBeenCalled();
		expect(mockRequest.user).toEqual({
			userId: "owner-123",
			role: "RESTAURANT_OWNER",
			email: "owner@example.com",
			restaurantId: "rest-123",
		});
	});
});
