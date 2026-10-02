import { describe, expect, it } from "@jest/globals";
import { deleteMenuItemParamsSchema } from "@/presentation/http/validators/delete-menu-item.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("delete-menu-item.validator", () => {
	describe("deleteMenuItemParamsSchema", () => {
		it("should pass with valid UUID restaurantId and menuItemId", () => {
			const result = deleteMenuItemParamsSchema.safeParse({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				menuItemId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
			});
			expect(result.success).toBe(true);
		});

		it("should fail with non-UUID restaurantId", () => {
			const result = deleteMenuItemParamsSchema.safeParse({
				restaurantId: "invalid-uuid",
				menuItemId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe(
					messages.INVALID_RESTAURANT_ID,
				);
			}
		});

		it("should fail with non-UUID menuItemId", () => {
			const result = deleteMenuItemParamsSchema.safeParse({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				menuItemId: "invalid-uuid",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe(
					messages.INVALID_MENU_ITEM_ID,
				);
			}
		});

		it("should fail when extra fields are present due to strict validation", () => {
			const result = deleteMenuItemParamsSchema.safeParse({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				menuItemId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
				extra: "unexpected",
			});
			expect(result.success).toBe(false);
		});
	});
});
