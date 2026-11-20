import { z } from "zod";

export const getPresignedUrlQuerySchema = z.object({
	key: z
		.string()
		.trim()
		.min(1, "Key is required")
		.refine((val) => !val.includes(".."), {
			message: "Key must not contain path traversal characters ('..')",
		}),
});

export type GetPresignedUrlQuery = z.infer<typeof getPresignedUrlQuerySchema>;
