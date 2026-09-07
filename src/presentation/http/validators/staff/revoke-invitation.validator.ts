import { z } from "zod";

export const revokeInvitationSchema = z
	.object({
		invitationId: z.string().optional(),
		email: z
			.preprocess(
				(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
				z.email({ message: "Invalid email address format" }),
			)
			.optional(),
	})
	.refine(
		(data) => Boolean(data.invitationId || data.email),
		"Either invitationId or email must be provided",
	);

export type RevokeInvitationInput = z.infer<typeof revokeInvitationSchema>;
