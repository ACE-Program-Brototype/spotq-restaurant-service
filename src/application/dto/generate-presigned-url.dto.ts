import type { generatePresignedUrlSchema } from "@presentation/http/validators/generate-presigned-url.validator";
import type z from "zod";

export type GeneratePresignedUrlDto = z.infer<
	typeof generatePresignedUrlSchema
>