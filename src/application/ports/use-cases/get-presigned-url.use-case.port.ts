import type {
	GetPresignedUrlQueryDto,
	GetPresignedUrlResponseDto,
} from "@/application/dtos/restaurant/get-presigned-url.dto";
export interface IGetPresignedUrlUseCase {
	execute(dto: GetPresignedUrlQueryDto): Promise<GetPresignedUrlResponseDto>;
}
