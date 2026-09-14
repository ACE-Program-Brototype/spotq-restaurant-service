import { z } from "zod";

export const getPresignedUrlQuerySchema = z
	.object({
		key: z.string().trim().min(1).optional(),
		s3_object_key: z.string().trim().min(1).optional(),
		object_key: z.string().trim().min(1).optional(),
	})
	.refine(
		(data) => Boolean(data.key || data.s3_object_key || data.object_key),
		{
			message: "A valid storage key ('key' or 's3_object_key') is required",
			path: ["key"],
		},
	)
	.refine(
		(data) => {
			const key = data.key || data.s3_object_key || data.object_key;
			return key ? !key.includes("..") : true;
		},
		{
			message: "Key must not contain path traversal characters ('..')",
			path: ["key"],
		},
	);

export type GetPresignedUrlQuery = z.infer<typeof getPresignedUrlQuerySchema>;
