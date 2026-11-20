import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const resetPasswordSchema = z.object({
	password: z
		.string({
			message: messages.PASSWORD_REQUIRED,
		})
		.min(8, messages.PASSWORD_MIN_LENGTH)
		.regex(/[A-Z]/, messages.PASSWORD_UPPERCASE_REQUIRED)
		.regex(/[a-z]/, messages.PASSWORD_LOWERCASE_REQUIRED)
		.regex(/[0-9]/, messages.PASSWORD_DIGIT_REQUIRED)
		.regex(/[^A-Za-z0-9]/, messages.PASSWORD_SPECIAL_REQUIRED),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
