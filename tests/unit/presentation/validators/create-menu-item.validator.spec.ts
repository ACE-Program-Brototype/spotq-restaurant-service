import { describe, expect, it } from "@jest/globals";
import {
	createMenuItemBodySchema,
	createMenuItemParamsSchema,
	createMenuItemVariantSchema,
} from "@/presentation/http/validators/create-menu-item.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

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

	const validBaseBody = {
		categoryId: validCategoryId,
		name: "Chicken Dum Biryani",
		description: "Slow-cooked aromatic basmati rice",
		price: 320.0,
		preparationTime: 25,
		isVegetarian: false,
		images: [{ objectKey: "menu/biryani.png", displayOrder: 0 }],
	};

	describe("createMenuItemBodySchema", () => {
		it("should pass with minimal valid body and default isAvailable to true", () => {
			const result = createMenuItemBodySchema.safeParse(validBaseBody);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.isAvailable).toBe(true);
			}
		});

		it("should pass with full nested payload", () => {
			const result = createMenuItemBodySchema.safeParse({
				...validBaseBody,
				calories: 650,
				isFeatured: true,
				isAvailable: false,
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
					{ addonId: validAddonId, priceOverride: 40.0 },
				],
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.isAvailable).toBe(false);
			}
		});

		it("should support snake_case fields as well", () => {
			const result = createMenuItemBodySchema.safeParse({
				category_id: validCategoryId,
				name: "Chicken Dum Biryani",
				description: "Slow-cooked aromatic basmati rice",
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

		it("should fail when description is missing", () => {
			const { description, ...withoutDescription } = validBaseBody;
			const result = createMenuItemBodySchema.safeParse(withoutDescription);
			expect(result.success).toBe(false);
			if (!result.success) {
				const error = result.error.issues.find((e) =>
					e.path.includes("description"),
				);
				expect(error?.message).toBe(messages.MENU_ITEM_DESCRIPTION_REQUIRED);
			}
		});

		it("should fail when description is empty string", () => {
			const result = createMenuItemBodySchema.safeParse({
				...validBaseBody,
				description: "   ",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				const error = result.error.issues.find((e) =>
					e.path.includes("description"),
				);
				expect(error?.message).toBe(messages.MENU_ITEM_DESCRIPTION_REQUIRED);
			}
		});

		it("should fail when preparationTime and preparation_time are missing", () => {
			const { preparationTime, ...withoutPrepTime } = validBaseBody;
			const result = createMenuItemBodySchema.safeParse(withoutPrepTime);
			expect(result.success).toBe(false);
			if (!result.success) {
				const error = result.error.issues.find((e) =>
					e.path.includes("preparationTime"),
				);
				expect(error?.message).toBe(messages.PREPARATION_TIME_REQUIRED);
			}
		});

		it("should fail when isVegetarian and is_vegetarian are missing", () => {
			const { isVegetarian, ...withoutVeg } = validBaseBody;
			const result = createMenuItemBodySchema.safeParse(withoutVeg);
			expect(result.success).toBe(false);
			if (!result.success) {
				const error = result.error.issues.find((e) =>
					e.path.includes("isVegetarian"),
				);
				expect(error?.message).toBe(messages.IS_VEGETARIAN_REQUIRED);
			}
		});

		it("should fail when images is missing", () => {
			const { images, ...withoutImages } = validBaseBody;
			const result = createMenuItemBodySchema.safeParse(withoutImages);
			expect(result.success).toBe(false);
			if (!result.success) {
				const error = result.error.issues.find((e) =>
					e.path.includes("images"),
				);
				expect(error?.message).toBe(messages.MENU_ITEM_IMAGES_REQUIRED);
			}
		});

		it("should fail when images array is empty", () => {
			const result = createMenuItemBodySchema.safeParse({
				...validBaseBody,
				images: [],
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				const error = result.error.issues.find((e) =>
					e.path.includes("images"),
				);
				expect(error?.message).toBe(messages.MENU_ITEM_IMAGES_REQUIRED);
			}
		});

		it("should fail when name is empty", () => {
			const result = createMenuItemBodySchema.safeParse({
				...validBaseBody,
				name: "   ",
			});
			expect(result.success).toBe(false);
		});

		it("should fail when price is negative", () => {
			const result = createMenuItemBodySchema.safeParse({
				...validBaseBody,
				price: -10.0,
			});
			expect(result.success).toBe(false);
		});

		it("should fail when variant price is negative", () => {
			const result = createMenuItemBodySchema.safeParse({
				...validBaseBody,
				variants: [{ name: "Half", price: -5 }],
			});
			expect(result.success).toBe(false);
		});

		it("should fail when addonId is not a valid UUID", () => {
			const result = createMenuItemBodySchema.safeParse({
				...validBaseBody,
				addons: [{ addonId: "not-a-uuid" }],
			});
			expect(result.success).toBe(false);
		});

		it("should fail when image has empty objectKey and object_key", () => {
			const result = createMenuItemBodySchema.safeParse({
				...validBaseBody,
				images: [{}],
			});
			expect(result.success).toBe(false);
		});

		it("should fail when addon has no addonId and no addon_id", () => {
			const result = createMenuItemBodySchema.safeParse({
				...validBaseBody,
				addons: [{}],
			});
			expect(result.success).toBe(false);
		});

		it("should fail when duplicate addon IDs are provided", () => {
			const result = createMenuItemBodySchema.safeParse({
				...validBaseBody,
				addons: [
					{ addonId: validAddonId },
					{ addonId: validAddonId },
				],
			});
			expect(result.success).toBe(false);
		});

		it("should fail when price exceeds 99999999.99", () => {
			const result = createMenuItemBodySchema.safeParse({
				...validBaseBody,
				name: "Gold Leaf Steak",
				price: 100000000,
			});
			expect(result.success).toBe(false);
		});

		it("should fail when variant price exceeds 99999999.99", () => {
			const result = createMenuItemBodySchema.safeParse({
				...validBaseBody,
				variants: [
					{ name: "Family Pack", price: 100000000 },
				],
			});
			expect(result.success).toBe(false);
		});

		it("should fail when addon price_override exceeds 99999999.99", () => {
			const result = createMenuItemBodySchema.safeParse({
				...validBaseBody,
				addons: [
					{ addonId: validAddonId, priceOverride: 100000000 },
				],
			});
			expect(result.success).toBe(false);
		});

		it("should fail with CATEGORY_ID_REQUIRED when categoryId and category_id are missing", () => {
			const { categoryId, ...withoutCat } = validBaseBody;
			const result = createMenuItemBodySchema.safeParse(withoutCat);
			expect(result.success).toBe(false);
			if (!result.success) {
				const error = result.error.issues.find((e) =>
					e.path.includes("categoryId"),
				);
				expect(error?.message).toBe(messages.CATEGORY_ID_REQUIRED);
			}
		});

		it("should fail with MENU_ITEM_PRICE_REQUIRED when neither price nor variants are provided", () => {
			const { price, ...withoutPrice } = validBaseBody;
			const result = createMenuItemBodySchema.safeParse(withoutPrice);
			expect(result.success).toBe(false);
			if (!result.success) {
				const error = result.error.issues.find((e) =>
					e.path.includes("price"),
				);
				expect(error?.message).toBe(messages.MENU_ITEM_PRICE_REQUIRED);
			}
		});
	});

	describe("createMenuItemVariantSchema", () => {
		it("should fail with VARIANT_NAME_REQUIRED when variant name is missing", () => {
			const result = createMenuItemVariantSchema.safeParse({
				price: 150.0,
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				const error = result.error.issues.find((e) =>
					e.path.includes("name"),
				);
				expect(error?.message).toBe(messages.VARIANT_NAME_REQUIRED);
			}
		});

		it("should fail with VARIANT_PRICE_REQUIRED when variant price is missing", () => {
			const result = createMenuItemVariantSchema.safeParse({
				name: "Half Portion",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				const error = result.error.issues.find((e) =>
					e.path.includes("price"),
				);
				expect(error?.message).toBe(messages.VARIANT_PRICE_REQUIRED);
			}
		});
	});
});
