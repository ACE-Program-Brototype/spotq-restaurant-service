import { z } from "zod";

export const verifyForgotPasswordOtpSchema = z.object({
	email: z.preprocess(
		(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
		z.email({ message: "Invalid email format" }),
	),
	otp: z
		.string({ message: "OTP is required" })
		.trim()
		.regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});

export type VerifyForgotPasswordOtpInput = z.infer<
	typeof verifyForgotPasswordOtpSchema
>;
