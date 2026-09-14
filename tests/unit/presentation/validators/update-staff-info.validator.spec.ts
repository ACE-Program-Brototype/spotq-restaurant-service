import { describe, expect, it } from "@jest/globals";
import {
	updateStaffInfoParamsSchema,
	updateStaffInfoSchema,
} from "@/presentation/http/validators/staff/update-staff-info.validator.ts";

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
	});

	it("should fail validation when staffId is missing or empty", () => {
		const result = updateStaffInfoParamsSchema.safeParse({
			restaurantId: "res_01ABC",
			staffId: "",
		});
		expect(result.success).toBe(false);
	});
});

describe("updateStaffInfoSchema", () => {
	it("should pass validation with valid name only", () => {
		const result = updateStaffInfoSchema.safeParse({
			name: "Ravi Kumar",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe("Ravi Kumar");
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
			expect(result.data.name).toBeUndefined();
		}
	});

	it("should pass validation with both valid name and phone", () => {
		const result = updateStaffInfoSchema.safeParse({
			name: "Ravi Kumar",
			phone: "+919876543210",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe("Ravi Kumar");
			expect(result.data.phone).toBe("+919876543210");
		}
	});

	it("should fail validation when request body is empty {}", () => {
		const result = updateStaffInfoSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it("should fail validation when unsupported fields like email are included", () => {
		const result = updateStaffInfoSchema.safeParse({
			name: "Ravi Kumar",
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

	it("should fail validation when name has less than 2 characters", () => {
		const result = updateStaffInfoSchema.safeParse({
			name: "A",
		});
		expect(result.success).toBe(false);
	});

	it("should fail validation when name contains only whitespace", () => {
		const result = updateStaffInfoSchema.safeParse({
			name: "   ",
		});
		expect(result.success).toBe(false);
	});

	it("should fail validation when phone format is invalid", () => {
		const result = updateStaffInfoSchema.safeParse({
			phone: "12345",
		});
		expect(result.success).toBe(false);
	});

	it("should fail validation when name is not a string", () => {
		const result = updateStaffInfoSchema.safeParse({
			name: 12345,
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

