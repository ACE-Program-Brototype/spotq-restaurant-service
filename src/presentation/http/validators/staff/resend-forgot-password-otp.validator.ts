import { z } from "zod";

export const resendForgotPasswordOtpSchema = z.object({
	email: z.preprocess(
		(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
		z.email({ message: "Invalid email format" }),
	),
});

export type ResendForgotPasswordOtpInput = z.infer<
	typeof resendForgotPasswordOtpSchema
>;
