import { z } from "zod";

export const resendInvitationSchema = z.object({
	email: z.preprocess(
		(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
		z.email({ message: "Invalid email address format" }),
	),
});

export type ResendInvitationInput = z.infer<typeof resendInvitationSchema>;
