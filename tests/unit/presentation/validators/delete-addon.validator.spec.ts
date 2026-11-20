import { describe, expect, it } from "@jest/globals";
import { deleteAddonParamsSchema } from "@/presentation/http/validators/delete-addon.validator.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("delete-addon.validator", () => {
	describe("deleteAddonParamsSchema", () => {
		it("should pass with valid UUID restaurantId and addonId", () => {
			const result = deleteAddonParamsSchema.safeParse({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				addonId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
			});
			expect(result.success).toBe(true);
		});

		it("should fail with non-UUID restaurantId", () => {
			const result = deleteAddonParamsSchema.safeParse({
				restaurantId: "invalid-uuid",
				addonId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe(
					messages.INVALID_RESTAURANT_ID,
				);
			}
		});

		it("should fail with non-UUID addonId", () => {
			const result = deleteAddonParamsSchema.safeParse({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				addonId: "invalid-uuid",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe(messages.INVALID_ADDON_ID);
			}
		});

		it("should fail when extra fields are present due to strict validation", () => {
			const result = deleteAddonParamsSchema.safeParse({
				restaurantId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
				addonId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
				extra: "unexpected",
			});
			expect(result.success).toBe(false);
		});
	});
});
