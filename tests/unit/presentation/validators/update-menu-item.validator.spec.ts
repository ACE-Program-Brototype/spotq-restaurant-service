import { describe, expect, it } from "@jest/globals";
import { MENU_ITEM_PRICE_MAX } from "@/domain/constants/menu-item.constants.ts";
import {
	updateMenuItemBodySchema,
	updateMenuItemParamsSchema,
	updateMenuItemVariantSchema,
} from "@/presentation/http/validators/update-menu-item.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("update-menu-item.validator", () => {
	const validRestaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const validMenuItemId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
	const validCategoryId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
	const validAddonId = "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44";

	describe("updateMenuItemParamsSchema", () => {
		it("should pass with valid restaurantId and menuItemId", () => {
			const result = updateMenuItemParamsSchema.safeParse({
				restaurantId: validRestaurantId,
				menuItemId: validMenuItemId,
			});
			expect(result.success).toBe(true);
		});

		it("should fail with invalid UUID restaurantId", () => {
			const result = updateMenuItemParamsSchema.safeParse({
				restaurantId: "invalid-uuid",
				menuItemId: validMenuItemId,
			});
			expect(result.success).toBe(false);
		});

		it("should fail with invalid UUID menuItemId", () => {
			const result = updateMenuItemParamsSchema.safeParse({
				restaurantId: validRestaurantId,
				menuItemId: "invalid-uuid",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("updateMenuItemVariantSchema", () => {
		it("should validate price within boundary", () => {
			const result = updateMenuItemVariantSchema.safeParse({
				name: "Regular",
				price: MENU_ITEM_PRICE_MAX,
			});
			expect(result.success).toBe(true);
		});

		it("should reject price exceeding MENU_ITEM_PRICE_MAX", () => {
			const result = updateMenuItemVariantSchema.safeParse({
				name: "Regular",
				price: MENU_ITEM_PRICE_MAX + 1,
			});
			expect(result.success).toBe(false);
		});
	});

	describe("updateMenuItemBodySchema", () => {
		it("should fail if no editable fields are provided", () => {
			const result = updateMenuItemBodySchema.safeParse({});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe(
					messages.AT_LEAST_ONE_FIELD_REQUIRED,
				);
			}
		});

		it("should pass with a single updated field", () => {
			const result = updateMenuItemBodySchema.safeParse({
				name: "Updated Biryani",
			});
			expect(result.success).toBe(true);
		});

		it("should pass with valid variants array", () => {
			const result = updateMenuItemBodySchema.safeParse({
				variants: [
					{
						name: "Full Portion",
						price: 350.0,
						isDefault: true,
					},
				],
			});
			expect(result.success).toBe(true);
		});

		it("should pass with valid categoryId", () => {
			const result = updateMenuItemBodySchema.safeParse({
				categoryId: validCategoryId,
			});
			expect(result.success).toBe(true);
		});

		it("should pass with valid addons array", () => {
			const result = updateMenuItemBodySchema.safeParse({
				addons: [
					{
						addonId: validAddonId,
						priceOverride: 50,
					},
				],
			});
			expect(result.success).toBe(true);
		});

		it("should fail with empty variants array (.min(1) validation)", () => {
			const result = updateMenuItemBodySchema.safeParse({
				variants: [],
			});
			expect(result.success).toBe(false);
		});

		it("should fail if multiple default variants are specified", () => {
			const result = updateMenuItemBodySchema.safeParse({
				variants: [
					{
						name: "Full",
						price: 300,
						isDefault: true,
					},
					{
						name: "Half",
						price: 200,
						isDefault: true,
					},
				],
			});
			expect(result.success).toBe(false);
		});
	});
});
