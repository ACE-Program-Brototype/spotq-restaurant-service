import { describe, expect, it } from "@jest/globals";
import {
	listMenuItemsParamsSchema,
	listMenuItemsQuerySchema,
} from "@/presentation/http/validators/list-menu-items.validator.ts";

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
	});
});
