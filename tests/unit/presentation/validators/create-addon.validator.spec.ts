import { describe, expect, it } from "@jest/globals";
import {
	createAddonBodySchema,
	createAddonParamsSchema,
	listAddonsParamsSchema,
} from "@/presentation/http/validators/create-addon.validator.ts";

describe("create-addon.validator", () => {
	describe("createAddonParamsSchema", () => {
		it("should pass with a valid UUID restaurantId", () => {
			const result = createAddonParamsSchema.safeParse({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			});
			expect(result.success).toBe(true);
		});

		it("should fail with non-UUID restaurantId", () => {
			const result = createAddonParamsSchema.safeParse({
				restaurantId: "not-a-uuid",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("listAddonsParamsSchema", () => {
		it("should pass with a valid UUID restaurantId", () => {
			const result = listAddonsParamsSchema.safeParse({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			});
			expect(result.success).toBe(true);
		});
	});

	describe("createAddonBodySchema", () => {
		it("should pass with valid minimal body", () => {
			const result = createAddonBodySchema.safeParse({
				name: "Extra Cheese",
				price: 50.0,
			});
			expect(result.success).toBe(true);
		});

		it("should pass with all valid fields", () => {
			const result = createAddonBodySchema.safeParse({
				name: "Extra Cheese",
				description: "Delicious melted cheese",
				price: 50.0,
				imageKey: "addons/cheese.png",
				isAvailable: true,
			});
			expect(result.success).toBe(true);
		});

		it("should fail when extra undeclared fields are provided (.strict())", () => {
			const result = createAddonBodySchema.safeParse({
				name: "Extra Cheese",
				price: 50.0,
				image_key: "addons/cheese.png",
			});
			expect(result.success).toBe(false);
		});

		it("should fail when name is missing or empty", () => {
			const resultEmpty = createAddonBodySchema.safeParse({
				name: "   ",
				price: 50.0,
			});
			expect(resultEmpty.success).toBe(false);

			const resultMissing = createAddonBodySchema.safeParse({
				price: 50.0,
			});
			expect(resultMissing.success).toBe(false);
		});

		it("should fail when price is negative", () => {
			const result = createAddonBodySchema.safeParse({
				name: "Extra Cheese",
				price: -10,
			});
			expect(result.success).toBe(false);
		});

		it("should fail when price exceeds max limit", () => {
			const result = createAddonBodySchema.safeParse({
				name: "Extra Cheese",
				price: 100000000,
			});
			expect(result.success).toBe(false);
		});

		it("should fail when price is missing", () => {
			const result = createAddonBodySchema.safeParse({
				name: "Extra Cheese",
			});
			expect(result.success).toBe(false);
		});

		it("should fail when description exceeds 1000 characters", () => {
			const result = createAddonBodySchema.safeParse({
				name: "Extra Cheese",
				price: 50.0,
				description: "a".repeat(1001),
			});
			expect(result.success).toBe(false);
		});

		it("should fail when price exceeds 99999999.99", () => {
			const result = createAddonBodySchema.safeParse({
				name: "Extra Cheese",
				price: 100000000,
			});
			expect(result.success).toBe(false);
		});
	});
});
