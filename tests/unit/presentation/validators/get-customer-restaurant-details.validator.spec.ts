import { describe, expect, it } from "@jest/globals";
import {
	getCustomerRestaurantDetailsParamsSchema,
	getCustomerRestaurantDetailsQuerySchema,
} from "@/presentation/http/validators/get-customer-restaurant-details.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("GetCustomerRestaurantDetails Validator", () => {
	const validUuid = "123e4567-e89b-12d3-a456-426614174000";
	const validCategoryUuid = "223e4567-e89b-12d3-a456-426614174001";

	describe("Params Schema", () => {
		it("should validate successfully with valid restaurantId UUID", () => {
			const result = getCustomerRestaurantDetailsParamsSchema.safeParse({
				restaurantId: validUuid,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.restaurantId).toBe(validUuid);
			}
		});

		it("should fail validation with malformed restaurantId UUID", () => {
			const result = getCustomerRestaurantDetailsParamsSchema.safeParse({
				restaurantId: "not-a-valid-uuid",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					messages.INVALID_RESTAURANT_ID,
				);
			}
		});

		it("should fail validation when restaurantId is not provided", () => {
			const result = getCustomerRestaurantDetailsParamsSchema.safeParse({});

			expect(result.success).toBe(false);
		});
	});

	describe("Query Schema", () => {
		it("should default includeMenu to true when omitted", () => {
			const result = getCustomerRestaurantDetailsQuerySchema.safeParse({});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.includeMenu).toBe(true);
				expect(result.data.categoryId).toBeUndefined();
			}
		});

		it("should parse string 'false' as boolean false for includeMenu", () => {
			const result = getCustomerRestaurantDetailsQuerySchema.safeParse({
				includeMenu: "false",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.includeMenu).toBe(false);
			}
		});

		it("should parse string 'true' as boolean true for includeMenu", () => {
			const result = getCustomerRestaurantDetailsQuerySchema.safeParse({
				includeMenu: "true",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.includeMenu).toBe(true);
			}
		});

		it("should fail validation with invalid includeMenu value", () => {
			const result = getCustomerRestaurantDetailsQuerySchema.safeParse({
				includeMenu: "invalid-boolean",
			});

			expect(result.success).toBe(false);
		});

		it("should accept valid categoryId UUID", () => {
			const result = getCustomerRestaurantDetailsQuerySchema.safeParse({
				categoryId: validCategoryUuid,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.categoryId).toBe(validCategoryUuid);
				expect(result.data.includeMenu).toBe(true);
			}
		});

		it("should fail validation with malformed categoryId UUID", () => {
			const result = getCustomerRestaurantDetailsQuerySchema.safeParse({
				categoryId: "invalid-category-uuid",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					messages.INVALID_CATEGORY_ID,
				);
			}
		});
	});
});
