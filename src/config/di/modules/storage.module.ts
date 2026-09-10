import { ContainerModule } from "inversify";
import type { IFilePolicyValidator } from "@/application/ports/services/file-policy-validator.port";
import type { IStorageService } from "@/application/ports/services/storage.service.port";
import type { IGeneratePresignedUrlUseCase } from "@/application/ports/use-cases/generate-presigned-url.use-case.port";
import { GeneratePresignedUrlUseCase } from "@/application/use-cases/generate-presigned-url.use-case";
import { TYPES } from "@/config/di/types";
import { FilePolicyValidatorService } from "@/infrastructure/services/file-policy-validator.service";
import { S3StorageService } from "@/infrastructure/services/s3-storage.service";
import { StorageController } from "@/presentation/http/controllers/storage.controller";

export const storageModule = new ContainerModule(({ bind }) => {
	// Controller
	bind(TYPES.Controller.StorageController)
		.to(StorageController)
		.inSingletonScope();

	// Use Case
	bind<IGeneratePresignedUrlUseCase>(
		TYPES.UseCases.GeneratePresignedUrlUseCase,
	)
		.to(GeneratePresignedUrlUseCase)
		.inSingletonScope();

	// Services
	bind<IStorageService>(TYPES.Services.Storage)
		.to(S3StorageService)
		.inSingletonScope();

	bind<IFilePolicyValidator>(TYPES.Services.FilePolicyValidator)
		.to(FilePolicyValidatorService)
		.inSingletonScope();
});
