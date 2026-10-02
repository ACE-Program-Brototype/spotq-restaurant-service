import { describe, expect, it } from "@jest/globals";
import {
	updateMenuItemStatusBodySchema,
	updateMenuItemStatusParamsSchema,
} from "@/presentation/http/validators/update-menu-item-status.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("updateMenuItemStatusParamsSchema", () => {
	const validRestaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const validMenuItemId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	it("should pass validation with valid restaurantId and menuItemId UUIDs", () => {
		const result = updateMenuItemStatusParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			menuItemId: validMenuItemId,
		});

		expect(result.success).toBe(true);
	});

	it("should fail validation when restaurantId is not a valid UUID", () => {
		const result = updateMenuItemStatusParamsSchema.safeParse({
			restaurantId: "invalid-uuid",
			menuItemId: validMenuItemId,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				messages.INVALID_RESTAURANT_ID,
			);
		}
	});

	it("should fail validation when menuItemId is not a valid UUID", () => {
		const result = updateMenuItemStatusParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			menuItemId: "invalid-uuid",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				messages.INVALID_MENU_ITEM_ID,
			);
		}
	});

	it("should fail validation when extra parameters are provided (strict mode)", () => {
		const result = updateMenuItemStatusParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			menuItemId: validMenuItemId,
			extraParam: "unexpected",
		});

		expect(result.success).toBe(false);
	});
});

describe("updateMenuItemStatusBodySchema", () => {
	it("should pass validation when isAvailable is true", () => {
		const result = updateMenuItemStatusBodySchema.safeParse({
			isAvailable: true,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.isAvailable).toBe(true);
		}
	});

	it("should pass validation when isAvailable is false", () => {
		const result = updateMenuItemStatusBodySchema.safeParse({
			isAvailable: false,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.isAvailable).toBe(false);
		}
	});

	it("should pass validation when is_available snake_case is provided", () => {
		const result = updateMenuItemStatusBodySchema.safeParse({
			is_available: false,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.is_available).toBe(false);
		}
	});

	it("should fail validation when neither isAvailable nor is_available is provided", () => {
		const result = updateMenuItemStatusBodySchema.safeParse({});

		expect(result.success).toBe(false);
	});

	it("should fail validation when isAvailable is null", () => {
		const result = updateMenuItemStatusBodySchema.safeParse({
			isAvailable: null,
		});

		expect(result.success).toBe(false);
	});

	it("should fail validation when isAvailable is a string", () => {
		const result = updateMenuItemStatusBodySchema.safeParse({
			isAvailable: "true",
		});

		expect(result.success).toBe(false);
	});

	it("should fail validation when extra fields are provided (strict mode)", () => {
		const result = updateMenuItemStatusBodySchema.safeParse({
			isAvailable: true,
			name: "Attempted Name Change",
		});

		expect(result.success).toBe(false);
	});
});
