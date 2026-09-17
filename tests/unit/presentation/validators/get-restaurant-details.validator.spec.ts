import { describe, expect, it } from "@jest/globals";
import { getRestaurantDetailsParamSchema } from "@/presentation/http/validators/admin/get-restaurant-details.validator.ts";

describe("getRestaurantDetailsParamSchema", () => {
	it("should accept valid UUID parameter", () => {
		const result = getRestaurantDetailsParamSchema.safeParse({
			id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.id).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
		}
	});

	it("should reject non-UUID string", () => {
		const result = getRestaurantDetailsParamSchema.safeParse({
			id: "not-a-valid-uuid",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toContain("Must be a valid UUID");
		}
	});

	it("should reject empty or missing id parameter", () => {
		const resultEmpty = getRestaurantDetailsParamSchema.safeParse({
			id: "",
		});
		expect(resultEmpty.success).toBe(false);

		const resultMissing = getRestaurantDetailsParamSchema.safeParse({});
		expect(resultMissing.success).toBe(false);
	});
});
