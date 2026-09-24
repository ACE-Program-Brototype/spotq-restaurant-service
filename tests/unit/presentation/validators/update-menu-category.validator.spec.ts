import { describe, expect, it } from "@jest/globals";
import {
	updateMenuCategoryBodySchema,
	updateMenuCategoryParamsSchema,
} from "@/presentation/http/validators/update-menu-category.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("updateMenuCategoryParamsSchema", () => {
	const validRestaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const validCategoryId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	it("should pass validation with valid restaurantId and categoryId UUIDs", () => {
		const result = updateMenuCategoryParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			categoryId: validCategoryId,
		});

		expect(result.success).toBe(true);
	});

	it("should fail validation when restaurantId is not a valid UUID", () => {
		const result = updateMenuCategoryParamsSchema.safeParse({
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
		const result = updateMenuCategoryParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			categoryId: "invalid-uuid",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(messages.INVALID_CATEGORY_ID);
		}
	});
});

describe("updateMenuCategoryBodySchema", () => {
	it("should pass validation when only name is provided", () => {
		const result = updateMenuCategoryBodySchema.safeParse({
			name: "Main Course",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe("Main Course");
		}
	});

	it("should pass validation when only description is provided", () => {
		const result = updateMenuCategoryBodySchema.safeParse({
			description: "Delicious dishes",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBe("Delicious dishes");
		}
	});

	it("should pass validation when description is null", () => {
		const result = updateMenuCategoryBodySchema.safeParse({
			description: null,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBeNull();
		}
	});

	it("should pass validation when only displayOrder is provided", () => {
		const result = updateMenuCategoryBodySchema.safeParse({
			displayOrder: 2,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.displayOrder).toBe(2);
		}
	});

	it("should pass validation when only isActive is provided", () => {
		const result = updateMenuCategoryBodySchema.safeParse({
			isActive: false,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.isActive).toBe(false);
		}
	});

	it("should pass validation with all valid fields", () => {
		const result = updateMenuCategoryBodySchema.safeParse({
			name: "Desserts",
			description: "Sweet treats",
			displayOrder: 5,
			isActive: true,
		});

		expect(result.success).toBe(true);
	});

	it("should fail validation when payload is completely empty {}", () => {
		const result = updateMenuCategoryBodySchema.safeParse({});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				messages.AT_LEAST_ONE_FIELD_REQUIRED,
			);
		}
	});

	it("should fail validation when name is empty or whitespace-only", () => {
		const result = updateMenuCategoryBodySchema.safeParse({
			name: "   ",
		});

		expect(result.success).toBe(false);
	});

	it("should fail validation when name exceeds 255 characters", () => {
		const result = updateMenuCategoryBodySchema.safeParse({
			name: "a".repeat(256),
		});

		expect(result.success).toBe(false);
	});

	it("should fail validation when description exceeds 1000 characters", () => {
		const result = updateMenuCategoryBodySchema.safeParse({
			description: "a".repeat(1001),
		});

		expect(result.success).toBe(false);
	});

	it("should fail validation when displayOrder is negative", () => {
		const result = updateMenuCategoryBodySchema.safeParse({
			displayOrder: -1,
		});

		expect(result.success).toBe(false);
	});

	it("should fail validation when unknown / system fields are included (strict mode)", () => {
		const result = updateMenuCategoryBodySchema.safeParse({
			name: "New Name",
			id: "category-id",
			restaurantId: "restaurant-id",
		});

		expect(result.success).toBe(false);
	});
});
