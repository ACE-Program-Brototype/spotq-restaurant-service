import { FileCategory } from "@/shared/storage/file-category.enum";
import { z } from "zod";

export const generatePresignedUrlSchema = z.object({
	entity_type: z
		.string()
		.trim()
		.min(1)
		.max(50)
		.refine((val) => !/[/\\.]/.test(val) && !val.includes(".."), {
			message: "entity_type must not contain path separators or path traversal characters",
		}),

	entity_id: z.string().uuid({ message: "entity_id must be a valid UUID" }),

	file_name: z.string().trim().min(1).max(255),

	content_type: z.string().trim().min(1),

	file_category: z.nativeEnum(FileCategory),

	file_size: z.number().int().positive(),
});