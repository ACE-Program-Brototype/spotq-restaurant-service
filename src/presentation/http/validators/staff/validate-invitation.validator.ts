import { z } from "zod";
import { messages } from "@/shared/constants/message.constants.ts";

export const validateInvitationSchema = z.object({
	token: z.string().min(1, messages.INVITATION_TOKEN_REQUIRED),
});

export type ValidateInvitationInput = z.infer<typeof validateInvitationSchema>;
