import type {
	GeneratePresignedUrlDto,
	GeneratePresignedUrlResponseDto,
} from "@/application/dtos/restaurant/generate-presigned-url.dto";

import type { AuthContext } from "@/shared/types/auth.types";
export type { AuthContext };

export interface IGeneratePresignedUrlUseCase {
	execute(
		dto: GeneratePresignedUrlDto,
		authContext?: AuthContext,
	): Promise<GeneratePresignedUrlResponseDto>;
}
