import { z } from "zod";

export const validateInvitationSchema = z.object({
	token: z.string().min(1, "Invitation token is required"),
});

export type ValidateInvitationInput = z.infer<typeof validateInvitationSchema>;
