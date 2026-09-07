import { z } from "zod";

export const acceptInvitationSchema = z.object({
	token: z.string().min(1, "Invitation token is required"),
	fullname: z
		.string()
		.trim()
		.min(2, "Full name must be at least 2 characters")
		.max(100, "Full name must not exceed 100 characters"),
	phone: z
		.string()
		.trim()
		.regex(
			/^(?:(?:\+91|91|0)[\s-]?)?[6-9]\d{9}$/,
			"Invalid Indian phone number format. Must be a 10-digit mobile number starting with 6-9, optionally prefixed with +91, 91, or 0",
		),
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

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
