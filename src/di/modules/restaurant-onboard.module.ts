import { IGeneratePresignedUrlUseCase } from "@application/ports/use-case/generate-presigned-url.use-case.port";
import { ContainerModule } from "inversify";
import { TYPES } from "../types";
import { GeneratePresignedUrlUseCase } from "@application/use-cases/generate-presigned-url.use-case";
import { IStorageService } from "@application/ports/services/storage.service.port";
import { S3StorageService } from "@infrastructure/services/s3-storage.service";
import { IFilePolicyValidator } from "@application/ports/services/file-policy-validator.port";
import { FilePolicyValidatorService } from "@infrastructure/services/file-policy-validator.service";

export const restaurantOnboardModule = new ContainerModule(({ bind }) => {
	
    bind<IGeneratePresignedUrlUseCase>(TYPES.UseCases.GeneratePresignedUrlUseCase).to(
        GeneratePresignedUrlUseCase
    );

    bind<IStorageService>(TYPES.Services.Storage).to(
        S3StorageService
    )

    bind<IFilePolicyValidator>(TYPES.Services.FilePolicyValidator).to(
        FilePolicyValidatorService
    )
});