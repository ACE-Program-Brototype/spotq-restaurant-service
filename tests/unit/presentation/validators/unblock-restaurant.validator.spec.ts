import { describe, expect, it } from "@jest/globals";
import { unblockRestaurantParamSchema } from "@/presentation/http/validators/admin/unblock-restaurant.validator.ts";

describe("unblockRestaurantParamSchema", () => {
	it("should accept valid UUID parameter", () => {
		const result = unblockRestaurantParamSchema.safeParse({
			id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.id).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
		}
	});

	it("should reject invalid UUID parameter", () => {
		const result = unblockRestaurantParamSchema.safeParse({
			id: "invalid-uuid-123",
		});

		expect(result.success).toBe(false);
	});

	it("should reject empty or missing id parameter", () => {
		const resultEmpty = unblockRestaurantParamSchema.safeParse({
			id: "",
		});
		expect(resultEmpty.success).toBe(false);

		const resultMissing = unblockRestaurantParamSchema.safeParse({});
		expect(resultMissing.success).toBe(false);
	});
});
