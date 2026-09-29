import {
	createMenuCategoryBodySchema,
	createMenuCategoryParamsSchema,
} from "@/presentation/http/validators/create-menu-category.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("CreateMenuCategoryValidator", () => {
	const validRestaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

	describe("createMenuCategoryParamsSchema", () => {
		it("should validate a valid UUID restaurantId successfully", () => {
			const result = createMenuCategoryParamsSchema.safeParse({
				restaurantId: validRestaurantId,
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.restaurantId).toBe(validRestaurantId);
			}
		});

		it("should reject an invalid or non-UUID restaurantId", () => {
			const result = createMenuCategoryParamsSchema.safeParse({
				restaurantId: "invalid-uuid-format",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					messages.INVALID_RESTAURANT_ID,
				);
			}
		});

		it("should reject when restaurantId is missing", () => {
			const result = createMenuCategoryParamsSchema.safeParse({});
			expect(result.success).toBe(false);
		});
	});

	describe("createMenuCategoryBodySchema", () => {
		it("should validate valid body with all fields successfully", () => {
			const result = createMenuCategoryBodySchema.safeParse({
				name: "Main Course",
				description: "Delicious mains",
				displayOrder: 2,
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.name).toBe("Main Course");
				expect(result.data.description).toBe("Delicious mains");
				expect(result.data.displayOrder).toBe(2);
			}
		});

		it("should validate when optional fields (description, displayOrder) are omitted", () => {
			const result = createMenuCategoryBodySchema.safeParse({
				name: "Drinks",
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.name).toBe("Drinks");
				expect(result.data.description).toBeUndefined();
				expect(result.data.displayOrder).toBeUndefined();
			}
		});

		it("should reject missing name", () => {
			const result = createMenuCategoryBodySchema.safeParse({});
			expect(result.success).toBe(false);
		});

		it("should reject empty or whitespace-only name", () => {
			const emptyRes = createMenuCategoryBodySchema.safeParse({ name: "" });
			expect(emptyRes.success).toBe(false);

			const wsRes = createMenuCategoryBodySchema.safeParse({ name: "   " });
			expect(wsRes.success).toBe(false);
		});

		it("should strip client-provided system fields from parsed data", () => {
			const result = createMenuCategoryBodySchema.safeParse({
				name: "Desserts",
				id: "custom-id-should-be-ignored",
				isActive: false,
				createdAt: "2026-01-01T00:00:00Z",
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.name).toBe("Desserts");
				expect((result.data as Record<string, unknown>).id).toBeUndefined();
				expect(
					(result.data as Record<string, unknown>).isActive,
				).toBeUndefined();
			}
		});
	});
});
