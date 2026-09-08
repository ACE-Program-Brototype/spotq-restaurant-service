import type { GeneratePresignedUrlDto } from "../../dto/generate-presigned-url.dto";

export interface IGeneratePresignedUrlUseCase {
	execute(dto: GeneratePresignedUrlDto): Promise<{
		uploadUrl: string;
		s3ObjectKey: string;
		expiresInSeconds: number;
	}>;
}