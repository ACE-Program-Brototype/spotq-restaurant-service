import { describe, expect, it } from "@jest/globals";
import {
	listStaffMenuItemsParamsSchema,
	listStaffMenuItemsQuerySchema,
} from "@/presentation/http/validators/list-staff-menu-items.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("ListStaffMenuItems Validators", () => {
	describe("listStaffMenuItemsParamsSchema", () => {
		it("should validate valid restaurantId UUID successfully", () => {
			const validParams = {
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			};
			const result = listStaffMenuItemsParamsSchema.safeParse(validParams);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.restaurantId).toBe(validParams.restaurantId);
			}
		});

		it("should fail validation when restaurantId is not a valid UUID", () => {
			const invalidParams = {
				restaurantId: "invalid-uuid-123",
			};
			const result = listStaffMenuItemsParamsSchema.safeParse(invalidParams);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					messages.INVALID_RESTAURANT_ID,
				);
			}
		});
	});

	describe("listStaffMenuItemsQuerySchema", () => {
		it("should apply default values when query is empty", () => {
			const result = listStaffMenuItemsQuerySchema.safeParse({});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual({
					page: 1,
					limit: 50,
					search: undefined,
					categoryId: undefined,
					isAvailable: undefined,
					includeInactive: false,
					includeVariants: true,
					sortBy: undefined,
					sortOrder: "asc",
				});
			}
		});

		it("should correctly parse snake_case parameters and string booleans", () => {
			const categoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
			const query = {
				page: "2",
				limit: "25",
				search: "Pizza",
				category_id: categoryId,
				is_available: "false",
				include_inactive: "true",
				include_variants: "false",
				sort_by: "price",
				sort_order: "desc",
			};

			const result = listStaffMenuItemsQuerySchema.safeParse(query);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual({
					page: 2,
					limit: 25,
					search: "Pizza",
					categoryId,
					isAvailable: false,
					includeInactive: true,
					includeVariants: false,
					sortBy: "price",
					sortOrder: "desc",
				});
			}
		});

		it("should map first_created and last_created sort aliases", () => {
			const firstRes = listStaffMenuItemsQuerySchema.safeParse({
				sort_by: "first_created",
			});
			expect(firstRes.success).toBe(true);
			if (firstRes.success) {
				expect(firstRes.data.sortBy).toBe("createdAt");
				expect(firstRes.data.sortOrder).toBe("asc");
			}

			const lastRes = listStaffMenuItemsQuerySchema.safeParse({
				sort_by: "last_created",
			});
			expect(lastRes.success).toBe(true);
			if (lastRes.success) {
				expect(lastRes.data.sortBy).toBe("createdAt");
				expect(lastRes.data.sortOrder).toBe("desc");
			}
		});

		it("should parse status filter strings (AVAILABLE / OUT_OF_STOCK / 86)", () => {
			const availableRes = listStaffMenuItemsQuerySchema.safeParse({
				status: "AVAILABLE",
			});
			expect(availableRes.success).toBe(true);
			if (availableRes.success) {
				expect(availableRes.data.isAvailable).toBe(true);
			}

			const outOfStockRes = listStaffMenuItemsQuerySchema.safeParse({
				status: "out_of_stock",
			});
			expect(outOfStockRes.success).toBe(true);
			if (outOfStockRes.success) {
				expect(outOfStockRes.data.isAvailable).toBe(false);
			}
		});

		it("should fail validation on invalid categoryId format", () => {
			const result = listStaffMenuItemsQuerySchema.safeParse({
				categoryId: "not-a-uuid",
			});
			expect(result.success).toBe(false);
		});
	});
});
