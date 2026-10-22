import { z } from "zod";
import { messages } from "@/shared/constants/message.constants";

export const deleteStorageObjectSchema = z
	.object({
		key: z
			.string()
			.trim()
			.min(1, messages.STORAGE_KEY_PARAM_REQUIRED)
			.optional(),
		objectKey: z
			.string()
			.trim()
			.min(1, messages.STORAGE_OBJECT_KEY_REQUIRED)
			.optional(),
	})
	.refine((data) => Boolean(data.key || data.objectKey), {
		message: messages.STORAGE_KEY_OR_OBJECT_KEY_REQUIRED,
		path: ["key"],
	})
	.refine(
		(data) => {
			const val = data.key || data.objectKey;
			return val ? !val.includes("..") : true;
		},
		{
			message: messages.STORAGE_PATH_TRAVERSAL_NOT_ALLOWED,
			path: ["key"],
		},
	);

export const deleteStorageObjectQuerySchema = deleteStorageObjectSchema;

export type DeleteStorageObjectQuery = z.infer<
	typeof deleteStorageObjectSchema
>;
