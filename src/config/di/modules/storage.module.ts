import { ContainerModule } from "inversify";
import type { IFilePolicyValidator } from "@/application/ports/services/file-policy-validator.port";
import type { IStorageService } from "@/application/ports/services/storage.service.port";
import type { IGeneratePresignedUrlUseCase } from "@/application/ports/use-cases/generate-presigned-url.use-case.port";
import type { IGetPresignedUrlUseCase } from "@/application/ports/use-cases/get-presigned-url.use-case.port";
import type { IDeleteStorageObjectUseCase } from "@/application/ports/use-cases/delete-storage-object.use-case.port";
import { GeneratePresignedUrlUseCase } from "@/application/use-cases/generate-presigned-url.use-case";
import { GetPresignedUrlUseCase } from "@/application/use-cases/get-presigned-url.use-case";
import { DeleteStorageObjectUseCase } from "@/application/use-cases/delete-storage-object.use-case";
import { TYPES } from "@/config/di/types";
import {
	type IStorageAccessValidator,
	StorageAccessValidatorService,
} from "@/domain/services/storage-access-validator.service";
import { FilePolicyValidatorService } from "@/infrastructure/services/file-policy-validator.service";
import { S3StorageService } from "@/infrastructure/services/s3-storage.service";
import { StorageController } from "@/presentation/http/controllers/storage.controller";

export const storageModule = new ContainerModule(({ bind }) => {
	// Controller
	bind(TYPES.Controller.StorageController)
		.to(StorageController)
		.inSingletonScope();

	// Use Cases
	bind<IGeneratePresignedUrlUseCase>(TYPES.UseCases.GeneratePresignedUrlUseCase)
		.to(GeneratePresignedUrlUseCase)
		.inSingletonScope();

	bind<IGetPresignedUrlUseCase>(TYPES.UseCases.GetPresignedUrlUseCase)
		.to(GetPresignedUrlUseCase)
		.inSingletonScope();

	bind<IDeleteStorageObjectUseCase>(TYPES.UseCases.DeleteStorageObjectUseCase)
		.to(DeleteStorageObjectUseCase)
		.inSingletonScope();

	// Services
	bind<IStorageService>(TYPES.Services.Storage)
		.to(S3StorageService)
		.inSingletonScope();

	bind<IFilePolicyValidator>(TYPES.Services.FilePolicyValidator)
		.to(FilePolicyValidatorService)
		.inSingletonScope();

	bind<IStorageAccessValidator>(TYPES.Services.StorageAccessValidator)
		.to(StorageAccessValidatorService)
		.inSingletonScope();
});
