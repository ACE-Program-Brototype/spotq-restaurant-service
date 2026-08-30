import { describe, expect, it } from "@jest/globals";
import { forgotPasswordSchema } from "@/presentation/validators/staff/forgot-password.validator.ts";
import { verifyForgotPasswordOtpSchema } from "@/presentation/validators/staff/verify-forgot-password-otp.validator.ts";

describe("ForgotPasswordValidators", () => {
	describe("forgotPasswordSchema", () => {
		it("should validate and trim valid email", () => {
			const result = forgotPasswordSchema.safeParse({
				email: "  Manager@SpotQ.com ",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.email).toBe("manager@spotq.com");
			}
		});

		it("should fail on invalid email", () => {
			const result = forgotPasswordSchema.safeParse({
				email: "not-an-email",
			});

			expect(result.success).toBe(false);
		});
	});

	describe("verifyForgotPasswordOtpSchema", () => {
		it("should validate valid email and 6-digit OTP", () => {
			const result = verifyForgotPasswordOtpSchema.safeParse({
				email: "manager@spotq.com",
				otp: "123456",
			});

			expect(result.success).toBe(true);
		});

		it("should reject non-6-digit OTP", () => {
			const result = verifyForgotPasswordOtpSchema.safeParse({
				email: "manager@spotq.com",
				otp: "12345",
			});

			expect(result.success).toBe(false);
		});
	});
});
