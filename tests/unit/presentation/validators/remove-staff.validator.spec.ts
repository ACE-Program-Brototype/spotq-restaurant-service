import { describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import { removeStaffParamsSchema } from "@/presentation/http/validators/staff/remove-staff.validator.ts";

describe("removeStaffParamsSchema", () => {
	const validRestaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const validStaffId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01";

	it("should pass when both restaurantId and staffId are valid UUIDs", () => {
		const result = removeStaffParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			staffId: validStaffId,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.restaurantId).toBe(validRestaurantId);
			expect(result.data.staffId).toBe(validStaffId);
		}
	});

	it("should fail when restaurantId is not a valid UUID", () => {
		const result = removeStaffParamsSchema.safeParse({
			restaurantId: "invalid-uuid",
			staffId: validStaffId,
		});

		expect(result.success).toBe(false);
	});

	it("should fail when staffId is not a valid UUID", () => {
		const result = removeStaffParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			staffId: "not-a-uuid",
		});

		expect(result.success).toBe(false);
	});

	it("should fail when parameters are missing", () => {
		const result = removeStaffParamsSchema.safeParse({});

		expect(result.success).toBe(false);
	});
});

describe("validateRequestParams with removeStaffParamsSchema", () => {
	const validRestaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const validStaffId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01";

	it("should return 422 with formatted errors when validation fails", () => {
		const {
			validateRequestParams,
		} = require("@/presentation/http/middleware/validation.middleware.ts");
		const { HTTP_STATUS } = require("@/shared/constants/http.constants.ts");
		const { messages } = require("@/shared/constants/message.constants.ts");

		const req = {
			params: {
				restaurantId: "invalid-uuid",
				staffId: validStaffId,
			},
		};

		let statusCalledWith: number | undefined;
		let jsonCalledWith: unknown;

		const res = {
			status: (code: number) => {
				statusCalledWith = code;
				return res;
			},
			json: (body: unknown) => {
				jsonCalledWith = body;
				return res;
			},
		};

		const next = jest.fn();

		const middleware = validateRequestParams(removeStaffParamsSchema);
		middleware(req as unknown as Request, res as unknown as Response, next);

		expect(statusCalledWith).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
		expect(jsonCalledWith).toEqual(
			expect.objectContaining({
				success: false,
				statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
				error: expect.arrayContaining([
					expect.objectContaining({
						field: "restaurantId",
						message: messages.INVALID_RESTAURANT_ID_FORMAT,
					}),
				]),
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should call next() and assign parsed params when validation succeeds", () => {
		const {
			validateRequestParams,
		} = require("@/presentation/http/middleware/validation.middleware.ts");

		const req = {
			params: {
				restaurantId: validRestaurantId,
				staffId: validStaffId,
			},
		};

		const res = {};
		const next = jest.fn();

		const middleware = validateRequestParams(removeStaffParamsSchema);
		middleware(req as unknown as Request, res as unknown as Response, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(req.params).toEqual({
			restaurantId: validRestaurantId,
			staffId: validStaffId,
		});
	});
});
