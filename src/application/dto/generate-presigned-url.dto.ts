import type { FileCategory } from "@/shared/storage/file-category.enum";

export interface GeneratePresignedUrlDto {
	onboarding_id: string;
	file_name: string;
	content_type: string;
	file_category: FileCategory;
	file_size: number;
}

export interface GeneratePresignedUrlResponseDto {
	uploadUrl: string;
	s3ObjectKey: string;
	expiresInSeconds: number;
}