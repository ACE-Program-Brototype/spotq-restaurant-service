import { describe, expect, it } from "@jest/globals";
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
	const validVariantId = "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55";

	describe("updateMenuItemParamsSchema", () => {
		it("should pass with valid UUID restaurantId and menuItemId", () => {
			const result = updateMenuItemParamsSchema.safeParse({
				restaurantId: validRestaurantId,
				menuItemId: validMenuItemId,
			});
			expect(result.success).toBe(true);
		});

		it("should fail with invalid UUID restaurantId", () => {
			const result = updateMenuItemParamsSchema.safeParse({
				restaurantId: "invalid-id",
				menuItemId: validMenuItemId,
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					messages.INVALID_RESTAURANT_ID,
				);
			}
		});

		it("should fail with invalid UUID menuItemId", () => {
			const result = updateMenuItemParamsSchema.safeParse({
				restaurantId: validRestaurantId,
				menuItemId: "invalid-id",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					messages.INVALID_MENU_ITEM_ID,
				);
			}
		});
	});

	describe("updateMenuItemBodySchema", () => {
		it("should pass with partial field update", () => {
			const result = updateMenuItemBodySchema.safeParse({
				name: "Updated Biryani",
				price: 350.0,
			});
			expect(result.success).toBe(true);
		});

		it("should pass with full update payload", () => {
			const result = updateMenuItemBodySchema.safeParse({
				categoryId: validCategoryId,
				name: "Updated Biryani",
				description: "Updated description",
				price: 350.0,
				preparationTime: 30,
				calories: 700,
				isVegetarian: true,
				isFeatured: true,
				isAvailable: false,
				images: [{ objectKey: "menu/new-image.png", displayOrder: 0 }],
				variants: [
					{
						id: validVariantId,
						name: "Full Portion",
						price: 350.0,
						isDefault: true,
						isAvailable: true,
					},
				],
				addons: [{ addonId: validAddonId, priceOverride: 50 }],
			});
			expect(result.success).toBe(true);
		});

		it("should pass with snake_case fields", () => {
			const result = updateMenuItemBodySchema.safeParse({
				category_id: validCategoryId,
				name: "Updated Biryani",
				preparation_time: 30,
				is_vegetarian: true,
				is_featured: false,
				is_available: true,
				images: [{ object_key: "menu/img.png", display_order: 1 }],
				variants: [
					{
						name: "Half Portion",
						price: 180,
						is_default: true,
						is_available: true,
					},
				],
				addons: [{ addon_id: validAddonId, price_override: 20 }],
			});
			expect(result.success).toBe(true);
		});

		it("should fail when body is empty", () => {
			const result = updateMenuItemBodySchema.safeParse({});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					messages.AT_LEAST_ONE_FIELD_REQUIRED,
				);
			}
		});

		it("should fail when multiple variants are marked as default", () => {
			const result = updateMenuItemBodySchema.safeParse({
				variants: [
					{ name: "Small", price: 100, isDefault: true },
					{ name: "Large", price: 200, isDefault: true },
				],
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues.find((i) =>
					i.path.includes("variants"),
				);
				expect(issue?.message).toBe(messages.MULTIPLE_DEFAULT_VARIANTS);
			}
		});

		it("should fail when duplicate variant IDs are specified", () => {
			const result = updateMenuItemBodySchema.safeParse({
				variants: [
					{ id: validVariantId, name: "Small", price: 100 },
					{ id: validVariantId, name: "Large", price: 200 },
				],
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues.find((i) =>
					i.path.includes("variants"),
				);
				expect(issue?.message).toBe(messages.DUPLICATE_VARIANT_IN_MENU_ITEM);
			}
		});

		it("should fail when duplicate addons are specified", () => {
			const result = updateMenuItemBodySchema.safeParse({
				addons: [{ addonId: validAddonId }, { addonId: validAddonId }],
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues.find((i) => i.path.includes("addons"));
				expect(issue?.message).toBe(messages.DUPLICATE_ADDON_IN_MENU_ITEM);
			}
		});

		it("should fail when price is negative", () => {
			const result = updateMenuItemBodySchema.safeParse({
				price: -10,
			});
			expect(result.success).toBe(false);
		});

		it("should fail when preparation time is negative", () => {
			const result = updateMenuItemBodySchema.safeParse({
				preparationTime: -5,
			});
			expect(result.success).toBe(false);
		});
	});

	describe("updateMenuItemVariantSchema", () => {
		it("should pass with variant ID and fields", () => {
			const result = updateMenuItemVariantSchema.safeParse({
				id: validVariantId,
				name: "Large",
				price: 250,
				sku: "SKU-LRG",
				isDefault: true,
			});
			expect(result.success).toBe(true);
		});

		it("should fail when variant name is empty", () => {
			const result = updateMenuItemVariantSchema.safeParse({
				name: "",
				price: 100,
			});
			expect(result.success).toBe(false);
		});
	});
});
