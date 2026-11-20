import { describe, expect, it } from "@jest/globals";
import { deleteMenuCategoryParamsSchema } from "@/presentation/http/validators/delete-menu-category.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("delete-menu-category.validator", () => {
	describe("deleteMenuCategoryParamsSchema", () => {
		it("should pass with valid UUID restaurantId and categoryId", () => {
			const result = deleteMenuCategoryParamsSchema.safeParse({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				categoryId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
			});
			expect(result.success).toBe(true);
		});

		it("should fail with non-UUID restaurantId", () => {
			const result = deleteMenuCategoryParamsSchema.safeParse({
				restaurantId: "invalid-uuid",
				categoryId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe(
					messages.INVALID_RESTAURANT_ID,
				);
			}
		});

		it("should fail with non-UUID categoryId", () => {
			const result = deleteMenuCategoryParamsSchema.safeParse({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				categoryId: "invalid-uuid",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe(
					messages.INVALID_CATEGORY_ID,
				);
			}
		});

		it("should fail when extra fields are present due to strict validation", () => {
			const result = deleteMenuCategoryParamsSchema.safeParse({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				categoryId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
				extra: "unexpected",
			});
			expect(result.success).toBe(false);
		});
	});
});
