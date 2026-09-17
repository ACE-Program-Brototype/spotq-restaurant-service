import { describe, expect, it } from "@jest/globals";
import {
	updateStaffInfoParamsSchema,
	updateStaffInfoSchema,
} from "@/presentation/http/validators/staff/update-staff-info.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("updateStaffInfoParamsSchema", () => {
	it("should pass validation with valid restaurantId and staffId", () => {
		const result = updateStaffInfoParamsSchema.safeParse({
			restaurantId: "res_01ABC",
			staffId: "stf_02AB",
		});
		expect(result.success).toBe(true);
	});

	it("should fail validation when restaurantId is missing or empty", () => {
		const result = updateStaffInfoParamsSchema.safeParse({
			restaurantId: "  ",
			staffId: "stf_02AB",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				messages.RESTAURANT_ID_REQUIRED,
			);
		}
	});

	it("should fail validation when staffId is missing or empty", () => {
		const result = updateStaffInfoParamsSchema.safeParse({
			restaurantId: "res_01ABC",
			staffId: "",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(messages.STAFF_ID_REQUIRED);
		}
	});
});

describe("updateStaffInfoSchema", () => {
	it("should pass validation with valid fullname only", () => {
		const result = updateStaffInfoSchema.safeParse({
			fullname: "Ravi Kumar",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.fullname).toBe("Ravi Kumar");
			expect(result.data.phone).toBeUndefined();
		}
	});

	it("should pass validation with valid phone only and normalize it", () => {
		const result = updateStaffInfoSchema.safeParse({
			phone: "9876543210",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.phone).toBe("+919876543210");
			expect(result.data.fullname).toBeUndefined();
		}
	});

	it("should pass validation with both valid fullname and phone", () => {
		const result = updateStaffInfoSchema.safeParse({
			fullname: "Ravi Kumar",
			phone: "+919876543210",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.fullname).toBe("Ravi Kumar");
			expect(result.data.phone).toBe("+919876543210");
		}
	});

	it("should fail validation when request body is empty {}", () => {
		const result = updateStaffInfoSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it("should fail validation when unsupported fields like email are included", () => {
		const result = updateStaffInfoSchema.safeParse({
			fullname: "Ravi Kumar",
			email: "newemail@example.com",
		});
		expect(result.success).toBe(false);
	});

	it("should fail validation when unsupported fields like role are included", () => {
		const result = updateStaffInfoSchema.safeParse({
			phone: "+919876543210",
			role: "MANAGER",
		});
		expect(result.success).toBe(false);
	});

	it("should fail validation when fullname has less than 2 characters", () => {
		const result = updateStaffInfoSchema.safeParse({
			fullname: "A",
		});
		expect(result.success).toBe(false);
	});

	it("should fail validation when fullname contains only whitespace", () => {
		const result = updateStaffInfoSchema.safeParse({
			fullname: "   ",
		});
		expect(result.success).toBe(false);
	});

	it("should fail validation when phone format is invalid", () => {
		const result = updateStaffInfoSchema.safeParse({
			phone: "12345",
		});
		expect(result.success).toBe(false);
	});

	it("should fail validation when fullname is not a string", () => {
		const result = updateStaffInfoSchema.safeParse({
			fullname: 12345,
		});
		expect(result.success).toBe(false);
	});

	it("should fail validation when phone is not a string", () => {
		const result = updateStaffInfoSchema.safeParse({
			phone: 9876543210,
		});
		expect(result.success).toBe(false);
	});
});
