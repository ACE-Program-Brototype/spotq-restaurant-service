import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const inviteStaffSchema = z.object({
	email: z.preprocess(
		(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
		z.email({ message: messages.INVALID_EMAIL_FORMAT }),
	),
});

export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;
