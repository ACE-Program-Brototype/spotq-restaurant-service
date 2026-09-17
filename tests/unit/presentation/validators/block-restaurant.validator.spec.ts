import { describe, expect, it } from "@jest/globals";
import {
	blockRestaurantBodySchema,
	blockRestaurantParamSchema,
} from "@/presentation/http/validators/admin/block-restaurant.validator.ts";

describe("blockRestaurantValidator", () => {
	describe("blockRestaurantParamSchema", () => {
		it("should accept valid UUID parameter", () => {
			const result = blockRestaurantParamSchema.safeParse({
				id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.id).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
			}
		});

		it("should reject invalid UUID parameter", () => {
			const result = blockRestaurantParamSchema.safeParse({
				id: "invalid-id",
			});

			expect(result.success).toBe(false);
		});
	});

	describe("blockRestaurantBodySchema", () => {
		it("should accept valid reason", () => {
			const result = blockRestaurantBodySchema.safeParse({
				reason: "Repeated hygiene standard violations",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.reason).toBe("Repeated hygiene standard violations");
			}
		});

		it("should trim reason whitespace", () => {
			const result = blockRestaurantBodySchema.safeParse({
				reason: "   Leading and trailing whitespace   ",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.reason).toBe("Leading and trailing whitespace");
			}
		});

		it("should reject empty or whitespace-only reason", () => {
			const resultEmpty = blockRestaurantBodySchema.safeParse({
				reason: "",
			});
			expect(resultEmpty.success).toBe(false);

			const resultWhitespace = blockRestaurantBodySchema.safeParse({
				reason: "   ",
			});
			expect(resultWhitespace.success).toBe(false);
		});

		it("should reject missing reason", () => {
			const result = blockRestaurantBodySchema.safeParse({});
			expect(result.success).toBe(false);
		});

		it("should reject reason exceeding 500 characters", () => {
			const result = blockRestaurantBodySchema.safeParse({
				reason: "a".repeat(501),
			});
			expect(result.success).toBe(false);
		});
	});
});
