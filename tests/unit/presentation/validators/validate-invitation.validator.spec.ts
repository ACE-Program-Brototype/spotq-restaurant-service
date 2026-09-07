import { describe, expect, it } from "@jest/globals";
import { validateInvitationSchema } from "@/presentation/http/validators/staff/validate-invitation.validator.ts";

describe("validateInvitationSchema", () => {
	it("should validate when token is provided", () => {
		const result = validateInvitationSchema.safeParse({
			token: "valid-token-123",
		});
		expect(result.success).toBe(true);
	});

	it("should fail validation when token is missing or empty", () => {
		const result1 = validateInvitationSchema.safeParse({});
		expect(result1.success).toBe(false);

		const result2 = validateInvitationSchema.safeParse({ token: "" });
		expect(result2.success).toBe(false);
	});
});
