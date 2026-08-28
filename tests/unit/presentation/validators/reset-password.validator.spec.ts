import { describe, expect, it } from "@jest/globals";
import { resetPasswordSchema } from "@/presentation/validators/staff/reset-password.validator.ts";

describe("ResetPasswordValidator", () => {
	it("should accept strong password with upper, lower, number, special char", () => {
		const result = resetPasswordSchema.safeParse({
			password: "SecurePassword@123",
		});

		expect(result.success).toBe(true);
	});

	it("should reject weak password without special char or digit", () => {
		const result = resetPasswordSchema.safeParse({
			password: "weakpassword",
		});

		expect(result.success).toBe(false);
	});

	it("should reject short password (< 8 chars)", () => {
		const result = resetPasswordSchema.safeParse({
			password: "P@1ss",
		});

		expect(result.success).toBe(false);
	});
});
