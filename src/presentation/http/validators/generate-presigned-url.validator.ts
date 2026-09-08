import { FileCategory } from "@shared/storage/file-category.enum";
import { z } from "zod";

export const generatePresignedUrlSchema = z.object({
	entity_id: z.uuid(),
	file_name: z.string().min(1).max(255),
	content_type: z.string().min(1),
	file_category: z.enum(FileCategory),
	file_size: z.number().int().positive(),
});