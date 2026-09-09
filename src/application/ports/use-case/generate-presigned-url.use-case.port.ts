import type {
	GeneratePresignedUrlDto,
	GeneratePresignedUrlResponseDto,
} from "@/application/dto/generate-presigned-url.dto";

export interface AuthContext {
	restaurantId?: string;
	email?: string;
	role?: string;
}

export interface IGeneratePresignedUrlUseCase {
	execute(
		dto: GeneratePresignedUrlDto,
		authContext?: AuthContext,
	): Promise<GeneratePresignedUrlResponseDto>;
}