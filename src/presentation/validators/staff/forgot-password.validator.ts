import { z } from "zod";

export const forgotPasswordSchema = z.object({
	email: z.preprocess(
		(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
		z.email({ message: "Invalid email format" }),
	),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
