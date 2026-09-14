import { inject, injectable } from "inversify";

import type {
	GetPresignedUrlQueryDto,
	GetPresignedUrlResponseDto,
} from "@/application/dtos/restaurant/get-presigned-url.dto";
import type { IStorageService } from "@/application/ports/services/storage.service.port";
import type { IGetPresignedUrlUseCase } from "@/application/ports/use-cases/get-presigned-url.use-case.port";
import { TYPES } from "@/config/di/types";
import { StorageKeyVO } from "@/domain/value-objects/storage-key.vo";

@injectable()
export class GetPresignedUrlUseCase implements IGetPresignedUrlUseCase {
	constructor(
		@inject(TYPES.Services.Storage)
		private readonly storageService: IStorageService,
	) {}

	async execute(
		dto: GetPresignedUrlQueryDto,
	): Promise<GetPresignedUrlResponseDto> {
		const storageKey = StorageKeyVO.create(dto.key);

		const result = await this.storageService.generatePresignedGetUrl({
			key: storageKey.value,
		});

		return result;
	}
}
