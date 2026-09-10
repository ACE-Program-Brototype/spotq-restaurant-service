import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const verifyForgotPasswordOtpSchema = z.object({
	email: z.preprocess(
		(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
		z.email({ message: messages.INVALID_EMAIL_FORMAT }),
	),
	otp: z
		.string({ message: messages.OTP_REQUIRED })
		.trim()
		.regex(/^\d{6}$/, messages.OTP_DIGITS_REQUIRED),
});

export type VerifyForgotPasswordOtpInput = z.infer<
	typeof verifyForgotPasswordOtpSchema
>;
