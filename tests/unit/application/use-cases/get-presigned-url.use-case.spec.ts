import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { IStorageService } from "@/application/ports/services/storage.service.port";
import { GetPresignedUrlUseCase } from "@/application/use-cases/get-presigned-url.use-case";
import { InvalidStorageKeyError } from "@/domain/errors/storage.errors";

describe("GetPresignedUrlUseCase", () => {
	let useCase: GetPresignedUrlUseCase;
	let mockStorageService: jest.Mocked<IStorageService>;

	beforeEach(() => {
		mockStorageService = {
			generatePresignedUploadUrl: jest.fn(),
			generatePresignedGetUrl: jest.fn<IStorageService["generatePresignedGetUrl"]>().mockResolvedValue({
				downloadUrl:
					"https://s3.amazonaws.com/test-bucket/download-url?signature=123",
				expiresInSeconds: 900,
			}),
		} as unknown as jest.Mocked<IStorageService>;

		useCase = new GetPresignedUrlUseCase(mockStorageService);
	});

	it("generates presigned download URL for a valid key", async () => {
		const result = await useCase.execute({
			key: "restaurants/a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/documents/fssai.pdf",
		});

		expect(mockStorageService.generatePresignedGetUrl).toHaveBeenCalledWith({
			key: "restaurants/a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/documents/fssai.pdf",
		});
		expect(result.downloadUrl).toBe(
			"https://s3.amazonaws.com/test-bucket/download-url?signature=123",
		);
		expect(result.expiresInSeconds).toBe(900);
	});

	it("strips leading slash from key", async () => {
		await useCase.execute({
			key: "/restaurants/a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/images/avatar.jpg",
		});

		expect(mockStorageService.generatePresignedGetUrl).toHaveBeenCalledWith({
			key: "restaurants/a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/images/avatar.jpg",
		});
	});

	it("throws InvalidStorageKeyError when key contains path traversal characters", async () => {
		await expect(
			useCase.execute({
				key: "../etc/passwd",
			}),
		).rejects.toThrow(InvalidStorageKeyError);
	});
});
