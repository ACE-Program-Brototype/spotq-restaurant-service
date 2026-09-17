import { describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import { validateRequestParams } from "@/presentation/http/middleware/validation.middleware.ts";
import { getStaffDetailParamsSchema } from "@/presentation/http/validators/staff/get-staff-detail.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("getStaffDetailParamsSchema", () => {
	it("should parse valid UUID format IDs successfully", async () => {
		const result = await getStaffDetailParamsSchema.parseAsync({
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			staffId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		});

		expect(result.restaurantId).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
		expect(result.staffId).toBe("b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01");
	});

	it("should fail validation when restaurantId is not a valid UUID", async () => {
		await expect(
			getStaffDetailParamsSchema.parseAsync({
				restaurantId: "res_01ABC",
				staffId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			}),
		).rejects.toThrow(messages.INVALID_RESTAURANT_ID);
	});

	it("should fail validation when staffId is not a valid UUID", async () => {
		await expect(
			getStaffDetailParamsSchema.parseAsync({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				staffId: "stf_02AB",
			}),
		).rejects.toThrow(messages.INVALID_STAFF_ID);
	});

	it("should fail validation when restaurantId is empty", async () => {
		await expect(
			getStaffDetailParamsSchema.parseAsync({
				restaurantId: "",
				staffId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			}),
		).rejects.toThrow(messages.INVALID_RESTAURANT_ID);
	});

	it("should fail validation when staffId is empty", async () => {
		await expect(
			getStaffDetailParamsSchema.parseAsync({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				staffId: "",
			}),
		).rejects.toThrow(messages.INVALID_STAFF_ID);
	});
});

describe("validateRequestParams with getStaffDetailParamsSchema", () => {
	it("should return 422 with Invalid staff ID message when staffId is invalid", async () => {
		const req = {
			params: {
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				staffId: "invalid-uuid",
			},
		} as unknown as Request;

		const res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
			locals: {},
		} as unknown as Response;

		const next = jest.fn();

		const middleware = validateRequestParams(getStaffDetailParamsSchema);
		await middleware(req, res, next);

		expect(res.status).toHaveBeenCalledWith(422);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 422,
				message: messages.VALIDATION_ERROR,
				error: expect.arrayContaining([
					expect.objectContaining({
						field: "staffId",
						message: messages.INVALID_STAFF_ID,
					}),
				]),
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should call next() and assign params when valid", async () => {
		const req = {
			params: {
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				staffId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
			},
		} as unknown as Request;

		const res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
			locals: {},
		} as unknown as Response;

		const next = jest.fn();

		const middleware = validateRequestParams(getStaffDetailParamsSchema);
		await middleware(req, res, next);

		expect(next).toHaveBeenCalled();
		expect(req.params).toEqual({
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			staffId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		});
	});
});
