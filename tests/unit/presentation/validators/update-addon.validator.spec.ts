import { describe, expect, it } from "@jest/globals";
import {
	updateAddonBodySchema,
	updateAddonParamsSchema,
} from "@/presentation/http/validators/update-addon.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("updateAddonParamsSchema", () => {
	const validRestaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const validAddonId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

	it("should pass validation with valid restaurantId and addonId UUIDs", () => {
		const result = updateAddonParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			addonId: validAddonId,
		});

		expect(result.success).toBe(true);
	});

	it("should fail validation when restaurantId is not a valid UUID", () => {
		const result = updateAddonParamsSchema.safeParse({
			restaurantId: "invalid-uuid",
			addonId: validAddonId,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				messages.INVALID_RESTAURANT_ID,
			);
		}
	});

	it("should fail validation when addonId is not a valid UUID", () => {
		const result = updateAddonParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			addonId: "invalid-uuid",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(messages.INVALID_ADDON_ID);
		}
	});

	it("should fail validation when extra parameters are provided (strict mode)", () => {
		const result = updateAddonParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			addonId: validAddonId,
			extraParam: "unexpected",
		});

		expect(result.success).toBe(false);
	});
});

describe("updateAddonBodySchema", () => {
	it("should pass validation when only name is provided", () => {
		const result = updateAddonBodySchema.safeParse({
			name: "Extra Cheese",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe("Extra Cheese");
		}
	});

	it("should pass validation when only description is provided", () => {
		const result = updateAddonBodySchema.safeParse({
			description: "Double portion of cheese",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBe("Double portion of cheese");
		}
	});

	it("should pass validation when description is null", () => {
		const result = updateAddonBodySchema.safeParse({
			description: null,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBeNull();
		}
	});

	it("should pass validation when only price is provided", () => {
		const result = updateAddonBodySchema.safeParse({
			price: 70,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.price).toBe(70);
		}
	});

	it("should pass validation when only imageKey is provided or null", () => {
		const result = updateAddonBodySchema.safeParse({
			imageKey: "addons/cheese-v2.png",
		});

		expect(result.success).toBe(true);

		const resultNull = updateAddonBodySchema.safeParse({
			imageKey: null,
		});
		expect(resultNull.success).toBe(true);
	});

	it("should pass validation when only isAvailable is provided", () => {
		const result = updateAddonBodySchema.safeParse({
			isAvailable: false,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.isAvailable).toBe(false);
		}
	});

	it("should pass validation with all valid fields", () => {
		const result = updateAddonBodySchema.safeParse({
			name: "Extra Cheese",
			description: "Double portion",
			price: 70,
			imageKey: "addons/cheese.png",
			isAvailable: true,
		});

		expect(result.success).toBe(true);
	});

	it("should fail validation when payload is completely empty {}", () => {
		const result = updateAddonBodySchema.safeParse({});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				messages.AT_LEAST_ONE_FIELD_REQUIRED,
			);
		}
	});

	it("should fail validation when name is empty or whitespace-only", () => {
		const result = updateAddonBodySchema.safeParse({
			name: "   ",
		});

		expect(result.success).toBe(false);
	});

	it("should fail validation when name exceeds 255 characters", () => {
		const result = updateAddonBodySchema.safeParse({
			name: "a".repeat(256),
		});

		expect(result.success).toBe(false);
	});

	it("should fail validation when description exceeds 1000 characters", () => {
		const result = updateAddonBodySchema.safeParse({
			description: "a".repeat(1001),
		});

		expect(result.success).toBe(false);
	});

	it("should fail validation when price is negative", () => {
		const result = updateAddonBodySchema.safeParse({
			price: -10,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				messages.ADDON_PRICE_NEGATIVE,
			);
		}
	});

	it("should fail validation when price exceeds max limit", () => {
		const result = updateAddonBodySchema.safeParse({
			price: 100000000,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe(
				messages.ADDON_PRICE_MAX_EXCEEDED,
			);
		}
	});

	it("should fail validation when unknown / system fields are included (strict mode)", () => {
		const result = updateAddonBodySchema.safeParse({
			name: "New Name",
			id: "addon-id",
			restaurantId: "restaurant-id",
		});

		expect(result.success).toBe(false);
	});
});
