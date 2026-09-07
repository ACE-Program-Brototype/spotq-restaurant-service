import { z } from "zod";

export const inviteStaffSchema = z.object({
	email: z.preprocess(
		(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
		z.email({ message: "Invalid email format" }),
	),
});

export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;
