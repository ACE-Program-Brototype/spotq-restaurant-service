import { describe, expect, it } from "@jest/globals";
import {
	listMenuItemsParamsSchema,
	listMenuItemsQuerySchema,
} from "@/presentation/http/validators/list-menu-items.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("ListMenuItemsValidator", () => {
	const validRestaurantId = "a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const validCategoryId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380c01";

	describe("listMenuItemsParamsSchema", () => {
		it("should validate a valid restaurantId param", () => {
			const result = listMenuItemsParamsSchema.safeParse({
				restaurantId: validRestaurantId,
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.restaurantId).toBe(validRestaurantId);
			}
		});

		it("should reject an invalid UUID", () => {
			const result = listMenuItemsParamsSchema.safeParse({
				restaurantId: "invalid-uuid",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("listMenuItemsQuerySchema", () => {
		it("should parse default query values when empty", () => {
			const result = listMenuItemsQuerySchema.safeParse({});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.page).toBe(1);
				expect(result.data.limit).toBe(10);
				expect(result.data.sortBy).toBe("createdAt");
				expect(result.data.sortOrder).toBe("desc");
			}
		});

		it("should parse query with all filters", () => {
			const result = listMenuItemsQuerySchema.safeParse({
				page: "2",
				limit: "20",
				search: "burger",
				category_id: validCategoryId,
				status: "available",
				min_price: "10.5",
				max_price: "30.0",
				is_vegetarian: "true",
				is_featured: "1",
				sort_by: "price",
				sort_order: "asc",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.page).toBe(2);
				expect(result.data.limit).toBe(20);
				expect(result.data.search).toBe("burger");
				expect(result.data.categoryId).toBe(validCategoryId);
				expect(result.data.status).toBe("AVAILABLE");
				expect(result.data.minPrice).toBe(10.5);
				expect(result.data.maxPrice).toBe(30.0);
				expect(result.data.isVegetarian).toBe(true);
				expect(result.data.isFeatured).toBe(true);
				expect(result.data.sortBy).toBe("price");
				expect(result.data.sortOrder).toBe("asc");
			}
		});

		it("should fail refinement if minPrice > maxPrice", () => {
			const result = listMenuItemsQuerySchema.safeParse({
				minPrice: 50,
				maxPrice: 20,
			});
			expect(result.success).toBe(false);
		});

		it("should normalize OUT_OF_STOCK status", () => {
			const result = listMenuItemsQuerySchema.safeParse({
				status: "out_of_stock",
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.status).toBe("OUT_OF_STOCK");
			}
		});

		it("should treat empty string prices as undefined instead of coercing to zero", () => {
			const result = listMenuItemsQuerySchema.safeParse({
				min_price: "",
				max_price: "  ",
				page: "",
				limit: "",
				sort_by: "",
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.minPrice).toBeUndefined();
				expect(result.data.maxPrice).toBeUndefined();
				expect(result.data.page).toBe(1);
				expect(result.data.limit).toBe(10);
				expect(result.data.sortBy).toBe("createdAt");
			}
		});

		it("should preserve zero when explicitly passed as '0'", () => {
			const result = listMenuItemsQuerySchema.safeParse({
				min_price: "0",
				max_price: "0",
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.minPrice).toBe(0);
				expect(result.data.maxPrice).toBe(0);
			}
		});

		it("should reject unrecognized nonempty boolean values for vegetarian and featured filters", () => {
			expect(
				listMenuItemsQuerySchema.safeParse({ isVegetarian: "invalid" }).success,
			).toBe(false);
			expect(
				listMenuItemsQuerySchema.safeParse({ is_vegetarian: "yes" }).success,
			).toBe(false);
			expect(
				listMenuItemsQuerySchema.safeParse({ isFeatured: "maybe" }).success,
			).toBe(false);
			expect(
				listMenuItemsQuerySchema.safeParse({ is_featured: "foo" }).success,
			).toBe(false);
		});

		it("should treat empty string boolean values as undefined", () => {
			const result = listMenuItemsQuerySchema.safeParse({
				isVegetarian: "",
				is_featured: "  ",
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.isVegetarian).toBeUndefined();
				expect(result.data.isFeatured).toBeUndefined();
			}
		});

		it("should reject invalid categoryId and category_id UUIDs with custom error message", () => {
			const res1 = listMenuItemsQuerySchema.safeParse({
				categoryId: "not-a-uuid",
			});
			expect(res1.success).toBe(false);
			if (!res1.success) {
				expect(res1.error.issues[0].message).toBe(messages.INVALID_CATEGORY_ID);
			}

			const res2 = listMenuItemsQuerySchema.safeParse({
				category_id: "not-a-uuid",
			});
			expect(res2.success).toBe(false);
			if (!res2.success) {
				expect(res2.error.issues[0].message).toBe(messages.INVALID_CATEGORY_ID);
			}
		});
	});
});
