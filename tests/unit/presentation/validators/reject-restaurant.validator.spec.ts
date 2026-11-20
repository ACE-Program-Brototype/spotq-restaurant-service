import {
	rejectRestaurantBodySchema,
	rejectRestaurantParamSchema,
} from "@/presentation/http/validators/admin/reject-restaurant.validator.ts";

describe("rejectRestaurantParamSchema", () => {
	it("should validate a correct UUID param", () => {
		const result = rejectRestaurantParamSchema.safeParse({
			id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.id).toBe("f47ac10b-58cc-4372-a567-0e02b2c3d479");
		}
	});

	it("should fail validation for an invalid UUID", () => {
		const result = rejectRestaurantParamSchema.safeParse({
			id: "invalid-uuid-123",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				"Invalid restaurant ID format. Must be a valid UUID",
			);
		}
	});
});

describe("rejectRestaurantBodySchema", () => {
	it("should validate a valid reason string", () => {
		const result = rejectRestaurantBodySchema.safeParse({
			reason: "The uploaded FSSAI license is blurry and unreadable.",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reason).toBe(
				"The uploaded FSSAI license is blurry and unreadable.",
			);
		}
	});

	it("should trim surrounding whitespace from reason", () => {
		const result = rejectRestaurantBodySchema.safeParse({
			reason: "   Invalid GST document   ",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reason).toBe("Invalid GST document");
		}
	});

	it("should fail validation when reason is empty or whitespace only", () => {
		const result = rejectRestaurantBodySchema.safeParse({
			reason: "   ",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				"Rejection reason cannot be empty",
			);
		}
	});

	it("should fail validation when reason is missing", () => {
		const result = rejectRestaurantBodySchema.safeParse({});

		expect(result.success).toBe(false);
	});

	it("should fail validation when reason exceeds 500 characters", () => {
		const longReason = "a".repeat(501);
		const result = rejectRestaurantBodySchema.safeParse({
			reason: longReason,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				"Rejection reason must not exceed 500 characters",
			);
		}
	});
});
