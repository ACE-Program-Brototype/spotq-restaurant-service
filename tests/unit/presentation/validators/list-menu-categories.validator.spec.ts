import { listMenuCategoriesParamSchema } from "@/presentation/http/validators/admin/list-menu-categories.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("ListMenuCategoriesValidator", () => {
	const validRestaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

	describe("listMenuCategoriesParamSchema", () => {
		it("should validate a valid UUID restaurantId successfully", () => {
			const result = listMenuCategoriesParamSchema.safeParse({
				restaurantId: validRestaurantId,
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.restaurantId).toBe(validRestaurantId);
			}
		});

		it("should reject an invalid or non-UUID restaurantId format", () => {
			const result = listMenuCategoriesParamSchema.safeParse({
				restaurantId: "invalid-uuid-12345",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					messages.INVALID_RESTAURANT_ID_FORMAT,
				);
			}
		});

		it("should reject when restaurantId parameter is missing", () => {
			const result = listMenuCategoriesParamSchema.safeParse({});
			expect(result.success).toBe(false);
		});
	});
});
