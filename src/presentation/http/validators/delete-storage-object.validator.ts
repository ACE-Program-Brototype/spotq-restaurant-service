import { z } from "zod";

export const deleteStorageObjectSchema = z
	.object({
		key: z.string().trim().min(1, "Key is required").optional(),
		objectKey: z.string().trim().min(1, "Object key is required").optional(),
	})
	.refine((data) => Boolean(data.key || data.objectKey), {
		message: "Either 'key' or 'objectKey' must be provided",
		path: ["key"],
	})
	.refine(
		(data) => {
			const val = data.key || data.objectKey;
			return val ? !val.includes("..") : true;
		},
		{
			message: "Key must not contain path traversal characters ('..')",
			path: ["key"],
		},
	);

export type DeleteStorageObjectInput = z.infer<
	typeof deleteStorageObjectSchema
>;
