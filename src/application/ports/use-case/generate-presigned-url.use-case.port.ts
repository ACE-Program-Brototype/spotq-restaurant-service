import type {
	GeneratePresignedUrlDto,
	GeneratePresignedUrlResponseDto,
} from "@/application/dto/generate-presigned-url.dto";

export interface IGeneratePresignedUrlUseCase {
	execute(
		dto: GeneratePresignedUrlDto,
	): Promise<GeneratePresignedUrlResponseDto>;
}