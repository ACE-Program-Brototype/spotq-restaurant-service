import type { IFilePolicyValidator } from "@/application/ports/services/file-policy-validator.port";
import type { IStorageService } from "@/application/ports/services/storage.service.port";
import { GeneratePresignedUrlUseCase } from "@/application/use-cases/generate-presigned-url.use-case";
import { FileCategory } from "@/shared/storage/file-category.enum";

describe("GeneratePresignedUrlUseCase", () => {
	let useCase: GeneratePresignedUrlUseCase;
	let mockFilePolicyValidator: jest.Mocked<IFilePolicyValidator>;
	let mockStorageService: jest.Mocked<IStorageService>;

	beforeEach(() => {
		mockFilePolicyValidator = {
			validate: jest.fn(),
		};
		mockStorageService = {
			generatePresignedUploadUrl: jest.fn().mockResolvedValue({
				uploadUrl: "https://s3.amazonaws.com/test-bucket/upload-url",
				expiresInSeconds: 900,
			}),
			getPresignedDownloadUrl: jest.fn(),
			deleteFile: jest.fn(),
		};

		useCase = new GeneratePresignedUrlUseCase(
			mockFilePolicyValidator,
			mockStorageService,
		);
	});

	it("generates presigned URL with sanitized key format", async () => {
		const dto = {
			entity_type: "restaurants",
			entity_id: "e4a77d13-6d0e-4a6a-8d19-58b1968817a0",
			file_name: "../unsafe/fssai_certificate.pdf",
			content_type: "application/pdf",
			file_category: FileCategory.DOCUMENTS,
			file_size: 1024,
		};

		const result = await useCase.execute(dto, {
			restaurantId: "e4a77d13-6d0e-4a6a-8d19-58b1968817a0",
		});

		expect(mockFilePolicyValidator.validate).toHaveBeenCalledWith({
			fileCategory: FileCategory.DOCUMENTS,
			contentType: "application/pdf",
			fileSize: 1024,
		});

		expect(mockStorageService.generatePresignedUploadUrl).toHaveBeenCalledWith({
			key: expect.stringMatching(
				/^restaurants\/e4a77d13-6d0e-4a6a-8d19-58b1968817a0\/documents\/[a-f0-9-]{36}_fssai_certificate\.pdf$/,
			),
			contentType: "application/pdf",
		});

		expect(result.uploadUrl).toBe("https://s3.amazonaws.com/test-bucket/upload-url");
	});

	it("rejects unauthorized access when entity_id does not match authContext.restaurantId", async () => {
		const dto = {
			entity_type: "restaurants",
			entity_id: "other-restaurant-id",
			file_name: "menu.pdf",
			content_type: "application/pdf",
			file_category: FileCategory.MENUS,
			file_size: 1024,
		};

		await expect(
			useCase.execute(dto, { restaurantId: "my-restaurant-id" }),
		).rejects.toThrow("Unauthorized entity access");
	});

	it("rejects invalid entity_type containing path traversal characters", async () => {
		const dto = {
			entity_type: "../restaurants",
			entity_id: "e4a77d13-6d0e-4a6a-8d19-58b1968817a0",
			file_name: "test.pdf",
			content_type: "application/pdf",
			file_category: FileCategory.DOCUMENTS,
			file_size: 1024,
		};

		await expect(useCase.execute(dto)).rejects.toThrow("Invalid entity_type");
	});
});
