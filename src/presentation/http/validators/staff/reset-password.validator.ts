import { z } from "zod";

export const resetPasswordSchema = z.object({
	password: z
		.string({
			message: "Password is required",
		})
		.min(8, "Password must be at least 8 characters long")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one digit")
		.regex(
			/[^A-Za-z0-9]/,
			"Password must contain at least one special character",
		),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
