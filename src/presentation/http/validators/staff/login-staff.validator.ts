import { z } from "zod";

export const loginStaffSchema = z.object({
	email: z.preprocess(
		(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
		z.email({ message: "Invalid email address format" }),
	),
	password: z
		.string({ message: "Password is required" })
		.min(6, "Password must be at least 6 characters"),
});

export type LoginStaffInput = z.infer<typeof loginStaffSchema>;
