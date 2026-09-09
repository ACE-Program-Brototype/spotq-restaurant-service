import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const loginStaffSchema = z.object({
	email: z.preprocess(
		(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
		z.email({ message: messages.INVALID_EMAIL_FORMAT }),
	),
	password: z
		.string({ message: messages.PASSWORD_REQUIRED })
		.min(6, messages.PASSWORD_MIN_LENGTH_6),
});

export type LoginStaffInput = z.infer<typeof loginStaffSchema>;
