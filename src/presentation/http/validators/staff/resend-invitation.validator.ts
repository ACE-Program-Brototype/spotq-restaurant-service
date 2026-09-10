import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const resendInvitationSchema = z.object({
	email: z.preprocess(
		(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
		z.email({ message: messages.INVALID_EMAIL_FORMAT }),
	),
});

export type ResendInvitationInput = z.infer<typeof resendInvitationSchema>;
