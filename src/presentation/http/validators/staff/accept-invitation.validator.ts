import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const acceptInvitationSchema = z.object({
	token: z.string().min(1, messages.INVITATION_TOKEN_REQUIRED),
	fullname: z
		.string()
		.trim()
		.min(2, messages.FULLNAME_MIN_LENGTH)
		.max(100, messages.FULLNAME_MAX_LENGTH),
	phone: z
		.string()
		.trim()
		.regex(
			/^(?:(?:\+91|91|0)[\s-]?)?[6-9]\d{9}$/,
			messages.INVALID_INDIAN_PHONE_FORMAT,
		)
		.transform((val) => {
			const digits = val.replace(/\D/g, "");
			const last10 = digits.slice(-10);
			return `+91${last10}`;
		}),
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

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
