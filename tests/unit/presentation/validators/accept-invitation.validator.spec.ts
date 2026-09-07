import { describe, expect, it } from "@jest/globals";
import { acceptInvitationSchema } from "@/presentation/http/validators/staff/accept-invitation.validator.ts";

describe("acceptInvitationSchema", () => {
	it("should pass validation with valid input and Indian phone numbers", () => {
		const validNumbers = [
			"+919876543210",
			"+91 9876543210",
			"+91-9876543210",
			"919876543210",
			"09876543210",
			"9876543210",
			"8876543210",
			"7876543210",
			"6876543210",
		];

		for (const phone of validNumbers) {
			const result = acceptInvitationSchema.safeParse({
				token: "invitation-token-123",
				fullname: "Jane Doe",
				phone,
				password: "SecurePassword1!",
			});
			expect(result.success).toBe(true);
		}
	});

	it("should fail validation for non-Indian or invalid phone numbers", () => {
		const invalidNumbers = [
			"+1234567890", // US number
			"5876543210", // starts with 5
			"987654321", // 9 digits
			"98765432100", // 11 digits
			"not-a-phone",
		];

		for (const phone of invalidNumbers) {
			const result = acceptInvitationSchema.safeParse({
				token: "invitation-token-123",
				fullname: "Jane Doe",
				phone,
				password: "SecurePassword1!",
			});
			expect(result.success).toBe(false);
		}
	});

	it("should fail validation if password does not meet complexity requirements", () => {
		const result = acceptInvitationSchema.safeParse({
			token: "invitation-token-123",
			fullname: "Jane Doe",
			phone: "+919876543210",
			password: "simplepassword",
		});
		expect(result.success).toBe(false);
	});

	it("should fail validation if fullname is too short", () => {
		const result = acceptInvitationSchema.safeParse({
			token: "invitation-token-123",
			fullname: "J",
			phone: "+919876543210",
			password: "SecurePassword1!",
		});
		expect(result.success).toBe(false);
	});
});
