import { describe, expect, it } from "@jest/globals";
import {
	createMenuItemBodySchema,
	createMenuItemParamsSchema,
} from "@/presentation/http/validators/create-menu-item.validator.ts";

describe("create-menu-item.validator", () => {
	const validRestaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const validCategoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
	const validAddonId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";

	describe("createMenuItemParamsSchema", () => {
		it("should pass with a valid UUID restaurantId", () => {
			const result = createMenuItemParamsSchema.safeParse({
				restaurantId: validRestaurantId,
			});
			expect(result.success).toBe(true);
		});

		it("should fail with invalid UUID restaurantId", () => {
			const result = createMenuItemParamsSchema.safeParse({
				restaurantId: "invalid-uuid",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("createMenuItemBodySchema", () => {
		it("should pass with minimal valid body", () => {
			const result = createMenuItemBodySchema.safeParse({
				categoryId: validCategoryId,
				name: "Chicken Dum Biryani",
				price: 320.0,
			});
			expect(result.success).toBe(true);
		});

		it("should pass with full nested payload", () => {
			const result = createMenuItemBodySchema.safeParse({
				categoryId: validCategoryId,
				name: "Chicken Dum Biryani",
				description: "Slow-cooked aromatic basmati rice",
				price: 320.0,
				preparationTime: 25,
				calories: 650,
				isVegetarian: false,
				isFeatured: true,
				isAvailable: true,
				images: [{ objectKey: "menu/biryani.png", displayOrder: 0 }],
				variants: [
					{
						sku: "BIRYANI-HALF",
						name: "Half Portion",
						price: 200.0,
						isDefault: false,
					},
					{
						sku: "BIRYANI-FULL",
						name: "Full Portion",
						price: 320.0,
						isDefault: true,
					},
				],
				addons: [
					{ addonId: validAddonId, priceOverride: 40.0, displayOrder: 0 },
				],
			});
			expect(result.success).toBe(true);
		});

		it("should support snake_case fields as well", () => {
			const result = createMenuItemBodySchema.safeParse({
				category_id: validCategoryId,
				name: "Chicken Dum Biryani",
				price: 320.0,
				preparation_time: 25,
				is_vegetarian: false,
				is_featured: true,
				is_available: true,
				images: [{ object_key: "menu/biryani.png", display_order: 0 }],
				variants: [
					{
						sku: "BIRYANI-HALF",
						name: "Half Portion",
						price: 200.0,
						is_default: true,
					},
				],
				addons: [
					{ addon_id: validAddonId, price_override: 35.0, display_order: 0 },
				],
			});
			expect(result.success).toBe(true);
		});

		it("should fail when name is empty", () => {
			const result = createMenuItemBodySchema.safeParse({
				categoryId: validCategoryId,
				name: "   ",
				price: 320.0,
			});
			expect(result.success).toBe(false);
		});

		it("should fail when price is negative", () => {
			const result = createMenuItemBodySchema.safeParse({
				categoryId: validCategoryId,
				name: "Chicken Dum Biryani",
				price: -10.0,
			});
			expect(result.success).toBe(false);
		});

		it("should fail when variant price is negative", () => {
			const result = createMenuItemBodySchema.safeParse({
				categoryId: validCategoryId,
				name: "Chicken Dum Biryani",
				price: 320.0,
				variants: [{ name: "Half", price: -5 }],
			});
			expect(result.success).toBe(false);
		});

		it("should fail when addonId is not a valid UUID", () => {
			const result = createMenuItemBodySchema.safeParse({
				categoryId: validCategoryId,
				name: "Chicken Dum Biryani",
				price: 320.0,
				addons: [{ addonId: "not-a-uuid" }],
			});
			expect(result.success).toBe(false);
		});

		it("should fail when image has empty objectKey and object_key", () => {
			const result = createMenuItemBodySchema.safeParse({
				categoryId: validCategoryId,
				name: "Chicken Dum Biryani",
				price: 320.0,
				images: [{}],
			});
			expect(result.success).toBe(false);
		});

		it("should fail when addon has no addonId and no addon_id", () => {
			const result = createMenuItemBodySchema.safeParse({
				categoryId: validCategoryId,
				name: "Chicken Dum Biryani",
				price: 320.0,
				addons: [{}],
			});
			expect(result.success).toBe(false);
		});

		it("should fail when duplicate addon IDs are provided", () => {
			const result = createMenuItemBodySchema.safeParse({
				categoryId: validCategoryId,
				name: "Chicken Dum Biryani",
				price: 320.0,
				addons: [
					{ addonId: validAddonId },
					{ addonId: validAddonId },
				],
			});
			expect(result.success).toBe(false);
		});
	});
});
