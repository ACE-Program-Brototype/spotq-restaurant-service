import { describe, expect, it } from "@jest/globals";
import {
	updateStaffStatusParamsSchema,
	updateStaffStatusSchema,
} from "@/presentation/http/validators/staff/update-staff-status.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("updateStaffStatusSchema (Body Validator)", () => {
	it("should pass for valid status ACTIVE", () => {
		const result = updateStaffStatusSchema.safeParse({ status: "ACTIVE" });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe("ACTIVE");
		}
	});

	it("should pass for valid status INACTIVE", () => {
		const result = updateStaffStatusSchema.safeParse({ status: "INACTIVE" });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe("INACTIVE");
		}
	});

	it("should reject invalid status like BLOCKED with correct message", () => {
		const result = updateStaffStatusSchema.safeParse({ status: "BLOCKED" });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				messages.INVALID_STAFF_STATUS,
			);
		}
	});

	it("should reject missing status", () => {
		const result = updateStaffStatusSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it("should reject extra properties due to strict schema", () => {
		const result = updateStaffStatusSchema.safeParse({
			status: "ACTIVE",
			role: "ADMIN",
		});
		expect(result.success).toBe(false);
	});
});

describe("updateStaffStatusParamsSchema (Params Validator)", () => {
	const validUUID1 = "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d";
	const validUUID2 = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

	it("should pass for valid UUID parameters", () => {
		const result = updateStaffStatusParamsSchema.safeParse({
			restaurantId: validUUID1,
			staffId: validUUID2,
		});
		expect(result.success).toBe(true);
	});

	it("should reject non-UUID restaurantId", () => {
		const result = updateStaffStatusParamsSchema.safeParse({
			restaurantId: "invalid-id",
			staffId: validUUID2,
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				messages.INVALID_RESTAURANT_ID_FORMAT,
			);
		}
	});

	it("should reject non-UUID staffId", () => {
		const result = updateStaffStatusParamsSchema.safeParse({
			restaurantId: validUUID1,
			staffId: "invalid-id",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				messages.INVALID_STAFF_ID_FORMAT,
			);
		}
	});
});
