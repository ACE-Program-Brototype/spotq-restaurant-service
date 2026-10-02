import { describe, expect, it } from "@jest/globals";
import {
	updateMenuCategoryStatusBodySchema,
	updateMenuCategoryStatusParamsSchema,
} from "@/presentation/http/validators/update-menu-category-status.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("updateMenuCategoryStatusParamsSchema", () => {
	const validRestaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const validCategoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	it("should pass validation with valid restaurantId and categoryId UUIDs", () => {
		const result = updateMenuCategoryStatusParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			categoryId: validCategoryId,
		});

		expect(result.success).toBe(true);
	});

	it("should fail validation when restaurantId is not a valid UUID", () => {
		const result = updateMenuCategoryStatusParamsSchema.safeParse({
			restaurantId: "invalid-uuid",
			categoryId: validCategoryId,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				messages.INVALID_RESTAURANT_ID,
			);
		}
	});

	it("should fail validation when categoryId is not a valid UUID", () => {
		const result = updateMenuCategoryStatusParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			categoryId: "invalid-uuid",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(messages.INVALID_CATEGORY_ID);
		}
	});

	it("should fail validation when extra parameters are provided (strict mode)", () => {
		const result = updateMenuCategoryStatusParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			categoryId: validCategoryId,
			extraParam: "unexpected",
		});

		expect(result.success).toBe(false);
	});
});

describe("updateMenuCategoryStatusBodySchema", () => {
	it("should pass validation when isActive is true", () => {
		const result = updateMenuCategoryStatusBodySchema.safeParse({
			isActive: true,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.isActive).toBe(true);
		}
	});

	it("should pass validation when isActive is false", () => {
		const result = updateMenuCategoryStatusBodySchema.safeParse({
			isActive: false,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.isActive).toBe(false);
		}
	});

	it("should fail validation when isActive is missing", () => {
		const result = updateMenuCategoryStatusBodySchema.safeParse({});

		expect(result.success).toBe(false);
	});

	it("should fail validation when isActive is null", () => {
		const result = updateMenuCategoryStatusBodySchema.safeParse({
			isActive: null,
		});

		expect(result.success).toBe(false);
	});

	it("should fail validation when isActive is a string", () => {
		const result = updateMenuCategoryStatusBodySchema.safeParse({
			isActive: "true",
		});

		expect(result.success).toBe(false);
	});

	it("should fail validation when isActive is a number", () => {
		const result = updateMenuCategoryStatusBodySchema.safeParse({
			isActive: 1,
		});

		expect(result.success).toBe(false);
	});

	it("should fail validation when extra fields are provided (strict mode)", () => {
		const result = updateMenuCategoryStatusBodySchema.safeParse({
			isActive: true,
			name: "Attempted Name Change",
		});

		expect(result.success).toBe(false);
	});
});
