import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const resendForgotPasswordOtpSchema = z.object({
	email: z.preprocess(
		(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
		z.email({ message: messages.INVALID_EMAIL_FORMAT }),
	),
});

export type ResendForgotPasswordOtpInput = z.infer<
	typeof resendForgotPasswordOtpSchema
>;
