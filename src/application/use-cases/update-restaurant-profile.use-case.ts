import { inject, injectable, optional } from "inversify";
import type { RestaurantProfileResponseDto } from "@/application/dtos/restaurant/restaurant-profile-response.dto";
import type { UpdateRestaurantProfileDto } from "@/application/dtos/restaurant/update-restaurant-profile.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IStorageService } from "@/application/ports/services/storage.service.port";
import type { IUpdateRestaurantProfileUseCase } from "@/application/ports/use-cases/update-restaurant-profile.use-case.port";
import { TYPES } from "@/config/di/types";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

@injectable()
export class UpdateRestaurantProfileUseCase
	implements IUpdateRestaurantProfileUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,

		@inject(TYPES.Services.Storage)
		@optional()
		private readonly storageService?: IStorageService,
	) {}

	async execute(
		restaurantId: string,
		dto: UpdateRestaurantProfileDto,
	): Promise<RestaurantProfileResponseDto> {
		const restaurant = await this.restaurantRepository.findById(restaurantId);
		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		const result = await this.restaurantRepository.updateProfileDetails(
			restaurantId,
			dto,
		);

		if (this.storageService) {
			if (result.profile?.logo && !result.profile.logo.startsWith("http")) {
				try {
					const { downloadUrl } =
						await this.storageService.generatePresignedGetUrl({
							key: result.profile.logo,
						});
					result.profile.logo = downloadUrl;
				} catch {
					// Fall back to original key if presigning fails
				}
			}

			if (
				result.profile?.coverImage &&
				!result.profile.coverImage.startsWith("http")
			) {
				try {
					const { downloadUrl } =
						await this.storageService.generatePresignedGetUrl({
							key: result.profile.coverImage,
						});
					result.profile.coverImage = downloadUrl;
				} catch {
					// Fall back to original key if presigning fails
				}
			}
		}

		return result;
	}
}
