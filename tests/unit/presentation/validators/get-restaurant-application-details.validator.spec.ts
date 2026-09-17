import { getRestaurantApplicationDetailsParamSchema } from "@/presentation/http/validators/admin/get-restaurant-application-details.validator.ts";

describe("getRestaurantApplicationDetailsParamSchema", () => {
	it("should validate a valid UUID param", () => {
		const result = getRestaurantApplicationDetailsParamSchema.safeParse({
			id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.id).toBe("f47ac10b-58cc-4372-a567-0e02b2c3d479");
		}
	});

	it("should reject an invalid UUID", () => {
		const result = getRestaurantApplicationDetailsParamSchema.safeParse({
			id: "invalid-id",
		});

		expect(result.success).toBe(false);
	});
});
