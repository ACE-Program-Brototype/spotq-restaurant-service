import { describe, expect, it, jest } from "@jest/globals";
import type { Request, Response } from "express";
import { validateRequestParams } from "@/presentation/http/middleware/validation.middleware.ts";
import { getStaffDetailParamsSchema } from "@/presentation/http/validators/staff/get-staff-detail.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("getStaffDetailParamsSchema", () => {
	it("should parse valid restaurantId and staffId successfully", async () => {
		const result = await getStaffDetailParamsSchema.parseAsync({
			restaurantId: "  res_01ABC  ",
			staffId: "  stf_02AB  ",
		});

		expect(result.restaurantId).toBe("res_01ABC");
		expect(result.staffId).toBe("stf_02AB");
	});

	it("should parse valid UUID format IDs successfully", async () => {
		const result = await getStaffDetailParamsSchema.parseAsync({
			restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			staffId: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
		});

		expect(result.restaurantId).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
		expect(result.staffId).toBe("b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01");
	});

	it("should fail validation when restaurantId has invalid characters", async () => {
		await expect(
			getStaffDetailParamsSchema.parseAsync({
				restaurantId: "res!@#$",
				staffId: "stf_02AB",
			}),
		).rejects.toThrow(messages.INVALID_RESTAURANT_ID);
	});

	it("should fail validation when staffId has invalid characters", async () => {
		await expect(
			getStaffDetailParamsSchema.parseAsync({
				restaurantId: "res_01ABC",
				staffId: "stf<script>",
			}),
		).rejects.toThrow(messages.INVALID_STAFF_ID);
	});

	it("should fail validation when restaurantId is empty", async () => {
		await expect(
			getStaffDetailParamsSchema.parseAsync({
				restaurantId: "   ",
				staffId: "stf_02AB",
			}),
		).rejects.toThrow(messages.INVALID_RESTAURANT_ID);
	});

	it("should fail validation when staffId is empty", async () => {
		await expect(
			getStaffDetailParamsSchema.parseAsync({
				restaurantId: "res_01ABC",
				staffId: "   ",
			}),
		).rejects.toThrow(messages.INVALID_STAFF_ID);
	});
});

describe("validateRequestParams with getStaffDetailParamsSchema", () => {
	it("should return 400 with Invalid staff ID message when staffId is invalid", () => {
		const req = {
			params: {
				restaurantId: "res_01ABC",
				staffId: "",
			},
		} as unknown as Request;

		const res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		} as unknown as Response;

		const next = jest.fn();

		const middleware = validateRequestParams(getStaffDetailParamsSchema);
		middleware(req, res, next);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				statusCode: 400,
				message: messages.INVALID_STAFF_ID,
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should call next() and sanitize params when valid", () => {
		const req = {
			params: {
				restaurantId: "  res_01ABC  ",
				staffId: "  stf_02AB  ",
			},
		} as unknown as Request;

		const res = {
			status: jest.fn().mockReturnThis() as never,
			json: jest.fn().mockReturnThis() as never,
		} as unknown as Response;

		const next = jest.fn();

		const middleware = validateRequestParams(getStaffDetailParamsSchema);
		middleware(req, res, next);

		expect(next).toHaveBeenCalled();
		expect(req.params).toEqual({
			restaurantId: "res_01ABC",
			staffId: "stf_02AB",
		});
	});
});
