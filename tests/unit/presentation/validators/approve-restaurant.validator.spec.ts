import { approveRestaurantParamSchema } from "@/presentation/http/validators/admin/approve-restaurant.validator.ts";

describe("approveRestaurantParamSchema", () => {
	it("should validate a correct UUID param", () => {
		const result = approveRestaurantParamSchema.safeParse({
			id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.id).toBe("f47ac10b-58cc-4372-a567-0e02b2c3d479");
		}
	});

	it("should fail validation for an invalid UUID", () => {
		const result = approveRestaurantParamSchema.safeParse({
			id: "invalid-uuid-123",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				"Invalid restaurant ID format. Must be a valid UUID",
			);
		}
	});

	it("should fail validation for missing id param", () => {
		const result = approveRestaurantParamSchema.safeParse({});

		expect(result.success).toBe(false);
	});
});
