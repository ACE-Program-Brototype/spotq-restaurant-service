import { inject, injectable } from "inversify";
import type { DeleteStorageObjectDto } from "@/application/dtos/restaurant/delete-storage-object.dto";
import type { IStorageAccessValidator } from "@/application/ports/services/storage-access-validator.service.port";
import type { IStorageService } from "@/application/ports/services/storage.service.port";
import type { IDeleteStorageObjectUseCase } from "@/application/ports/use-cases/delete-storage-object.use-case.port";
import { TYPES } from "@/config/di/types";
import { StorageKeyVO } from "@/domain/value-objects/storage-key.vo";
import type { AuthContext } from "@/shared/types/auth.types";

@injectable()
export class DeleteStorageObjectUseCase implements IDeleteStorageObjectUseCase {
	constructor(
		@inject(TYPES.Services.Storage)
		private readonly storageService: IStorageService,
		@inject(TYPES.Services.StorageAccessValidator)
		private readonly storageAccessValidator: IStorageAccessValidator,
	) {}

	async execute(
		dto: DeleteStorageObjectDto,
		authContext?: AuthContext,
	): Promise<void> {
		const storageKey = StorageKeyVO.create(dto.key);
		const normalizedKey = storageKey.value;

		this.storageAccessValidator.validateOwnership(normalizedKey, authContext);

		await this.storageService.deleteObject(normalizedKey);
	}
}
