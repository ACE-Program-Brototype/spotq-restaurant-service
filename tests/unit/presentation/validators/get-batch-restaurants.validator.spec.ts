import { describe, expect, it } from "@jest/globals";
import { getBatchRestaurantsBodySchema } from "@/presentation/http/validators/internal/get-batch-restaurants.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("get-batch-restaurants.validator", () => {
	const validId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

	it("should pass with a valid array of UUIDs", () => {
		const result = getBatchRestaurantsBodySchema.safeParse({
			restaurantIds: [validId],
		});
		expect(result.success).toBe(true);
	});

	it("should fail when restaurantIds array is empty", () => {
		const result = getBatchRestaurantsBodySchema.safeParse({
			restaurantIds: [],
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				messages.RESTAURANT_IDS_REQUIRED,
			);
		}
	});

	it("should fail when restaurantIds array exceeds 100 items", () => {
		const result = getBatchRestaurantsBodySchema.safeParse({
			restaurantIds: Array(101).fill(validId),
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				messages.RESTAURANT_IDS_MAX_LIMIT,
			);
		}
	});

	it("should fail when an invalid UUID is passed", () => {
		const result = getBatchRestaurantsBodySchema.safeParse({
			restaurantIds: ["not-a-valid-uuid"],
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				messages.INVALID_RESTAURANT_ID_FORMAT,
			);
		}
	});

	it("should reject unrecognized extra keys (.strict())", () => {
		const result = getBatchRestaurantsBodySchema.safeParse({
			restaurantIds: [validId],
			extraField: "not-allowed",
		});
		expect(result.success).toBe(false);
	});
});
