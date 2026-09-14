export interface GetPresignedUrlQueryDto {
	key: string;
}

export interface GetPresignedUrlResponseDto {
	downloadUrl: string;
	expiresInSeconds: number;
}
