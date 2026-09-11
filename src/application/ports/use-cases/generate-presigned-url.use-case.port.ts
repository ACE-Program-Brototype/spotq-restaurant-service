import type {
	GeneratePresignedUrlDto,
	GeneratePresignedUrlResponseDto,
} from "@/application/dtos/restaurant/generate-presigned-url.dto";

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
