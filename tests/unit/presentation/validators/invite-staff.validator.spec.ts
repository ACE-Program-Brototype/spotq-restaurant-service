import { describe, expect, it } from "@jest/globals";
import { inviteStaffSchema } from "@/presentation/http/validators/staff/invite-staff.validator.ts";

describe("inviteStaffSchema", () => {
	it("should validate a correct email", () => {
		const result = inviteStaffSchema.safeParse({
			email: "staff@example.com",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.email).toBe("staff@example.com");
		}
	});

	it("should trim and lowercase email", () => {
		const result = inviteStaffSchema.safeParse({
			email: "  Staff@EXAMPLE.COM  ",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.email).toBe("staff@example.com");
		}
	});

	it("should fail on invalid email format", () => {
		const result = inviteStaffSchema.safeParse({
			email: "invalid-email",
		});

		expect(result.success).toBe(false);
	});

	it("should fail on empty or missing email", () => {
		const result = inviteStaffSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});
