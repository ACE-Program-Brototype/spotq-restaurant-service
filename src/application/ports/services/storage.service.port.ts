export interface IStorageService {
	generatePresignedUploadUrl(params: {
		key: string;
		contentType: string;
		expiresInSeconds: number;
	}): Promise<string>;
}