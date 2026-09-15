import { describe, expect, it } from "@jest/globals";
import { removeStaffParamsSchema } from "@/presentation/http/validators/staff/remove-staff.validator.ts";

describe("removeStaffParamsSchema", () => {
	const validRestaurantId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
	const validStaffId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01";

	it("should pass when both restaurantId and staffId are valid UUIDs", () => {
		const result = removeStaffParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			staffId: validStaffId,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.restaurantId).toBe(validRestaurantId);
			expect(result.data.staffId).toBe(validStaffId);
		}
	});

	it("should fail when restaurantId is not a valid UUID", () => {
		const result = removeStaffParamsSchema.safeParse({
			restaurantId: "invalid-uuid",
			staffId: validStaffId,
		});

		expect(result.success).toBe(false);
	});

	it("should fail when staffId is not a valid UUID", () => {
		const result = removeStaffParamsSchema.safeParse({
			restaurantId: validRestaurantId,
			staffId: "not-a-uuid",
		});

		expect(result.success).toBe(false);
	});

	it("should fail when parameters are missing", () => {
		const result = removeStaffParamsSchema.safeParse({});

		expect(result.success).toBe(false);
	});
});
