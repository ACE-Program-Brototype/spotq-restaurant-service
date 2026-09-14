import type {
	GetPresignedUrlQueryDto,
	GetPresignedUrlResponseDto,
} from "@/application/dtos/restaurant/get-presigned-url.dto";
import type { IUseCase } from "./use-case.port";

export type IGetPresignedUrlUseCase = IUseCase<
	GetPresignedUrlQueryDto,
	GetPresignedUrlResponseDto
>;
