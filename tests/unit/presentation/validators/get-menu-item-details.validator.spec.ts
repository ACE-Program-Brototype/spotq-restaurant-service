import { describe, expect, it } from "@jest/globals";
import { getMenuItemDetailsParamsSchema } from "@/presentation/http/validators/get-menu-item-details.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("getMenuItemDetailsParamsSchema", () => {
	const validRestaurantId = "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const validMenuItemId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22";

	it("should pass validation with valid UUIDs", () => {
		const result = getMenuItemDetailsParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			menuItemId: validMenuItemId,
		});

		expect(result.success).toBe(true);
	});

	it("should fail validation when restaurantId is not a valid UUID", () => {
		const result = getMenuItemDetailsParamsSchema.safeParse({
			restaurantId: "invalid-uuid",
			menuItemId: validMenuItemId,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				messages.INVALID_RESTAURANT_ID,
			);
		}
	});

	it("should fail validation when menuItemId is not a valid UUID", () => {
		const result = getMenuItemDetailsParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			menuItemId: "invalid-uuid",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				messages.INVALID_MENU_ITEM_ID,
			);
		}
	});
});
