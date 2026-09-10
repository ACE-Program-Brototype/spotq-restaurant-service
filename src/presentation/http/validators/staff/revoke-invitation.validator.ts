import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const revokeInvitationSchema = z
	.object({
		invitationId: z.string().optional(),
		email: z
			.preprocess(
				(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
				z.email({ message: messages.INVALID_EMAIL_FORMAT }),
			)
			.optional(),
	})
	.refine(
		(data) => Boolean(data.invitationId || data.email),
		messages.EITHER_INVITATION_ID_OR_EMAIL_REQUIRED,
	);

export type RevokeInvitationInput = z.infer<typeof revokeInvitationSchema>;
