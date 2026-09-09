export interface GeneratePresignedUploadUrlInput {
	key: string;
	contentType: string;
	expiresInSeconds?: number;
}

export interface GeneratePresignedUploadUrlResult {
	uploadUrl: string;
	expiresInSeconds: number;
}

export interface IStorageService {
	generatePresignedUploadUrl(
		params: GeneratePresignedUploadUrlInput,
	): Promise<GeneratePresignedUploadUrlResult>;
}