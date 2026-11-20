import { z } from "zod";

export const listStaffInvitationsSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	status: z.enum(["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"]).optional(),
	search: z
		.string()
		.trim()
		.transform((val) => (val === "" ? undefined : val))
		.optional(),
	sortBy: z
		.enum(["createdAt", "expiresAt", "email", "status"])
		.default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ListStaffInvitationsQuery = z.infer<
	typeof listStaffInvitationsSchema
>;
