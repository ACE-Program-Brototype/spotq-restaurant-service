import { describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import {
	validateRequestParams,
	validateRequestQuery,
} from "@/presentation/http/middleware/validation.middleware.ts";
import {
	getCustomerRestaurantDetailsParamsSchema,
	getCustomerRestaurantDetailsQuerySchema,
} from "@/presentation/http/validators/get-customer-restaurant-details.validator.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";

describe("Validation Middleware with Custom Status Code", () => {
	it("returns 400 Bad Request when restaurantId in params is a malformed UUID", async () => {
		const middleware = validateRequestParams(
			getCustomerRestaurantDetailsParamsSchema,
			HTTP_STATUS.BAD_REQUEST,
		);

		const req = {
			params: {
				restaurantId: "invalid-uuid-string",
			},
		} as unknown as Request;

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			locals: {},
		} as unknown as Response;
		const next = jest.fn() as NextFunction;

		await middleware(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				statusCode: HTTP_STATUS.BAD_REQUEST,
				success: false,
			}),
		);
	});

	it("passes to next() and populates res.locals.params when restaurantId is valid UUID", async () => {
		const middleware = validateRequestParams(
			getCustomerRestaurantDetailsParamsSchema,
			HTTP_STATUS.BAD_REQUEST,
		);

		const validUuid = "123e4567-e89b-12d3-a456-426614174000";
		const req = {
			params: {
				restaurantId: validUuid,
			},
		} as unknown as Request;

		const res = {
			status: jest.fn(),
			locals: {},
		} as unknown as Response;
		const next = jest.fn() as NextFunction;

		await middleware(req, res, next);

		expect(next).toHaveBeenCalled();
		expect(res.locals.params).toEqual({
			restaurantId: validUuid,
		});
	});

	it("returns 400 Bad Request when categoryId in query is a malformed UUID", async () => {
		const middleware = validateRequestQuery(
			getCustomerRestaurantDetailsQuerySchema,
			HTTP_STATUS.BAD_REQUEST,
		);

		const req = {
			query: {
				categoryId: "not-a-valid-uuid",
			},
		} as unknown as Request;

		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = {
			status: statusMock,
			locals: {},
		} as unknown as Response;
		const next = jest.fn() as NextFunction;

		await middleware(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
	});
});
