import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const forgotPasswordSchema = z.object({
	email: z.preprocess(
		(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
		z.email({ message: messages.INVALID_EMAIL_FORMAT }),
	),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
