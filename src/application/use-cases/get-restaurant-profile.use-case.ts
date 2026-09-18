import { inject, injectable, optional } from "inversify";
import type { RestaurantProfileResponseDto } from "@/application/dtos/restaurant/restaurant-profile-response.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IStorageService } from "@/application/ports/services/storage.service.port.ts";
import type { IGetRestaurantProfileUseCase } from "@/application/ports/use-cases/get-restaurant-profile.use-case.port.ts";
import { TYPES } from "@/config/di/types";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";

@injectable()
export class GetRestaurantProfileUseCase
	implements IGetRestaurantProfileUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,

		@inject(TYPES.Services.Storage)
		@optional()
		private readonly storageService?: IStorageService,
	) {}

	async execute(restaurantId: string): Promise<RestaurantProfileResponseDto> {
		if (!this.restaurantRepository.getRestaurantProfileDetails) {
			throw new RestaurantNotFoundError();
		}

		const result =
			await this.restaurantRepository.getRestaurantProfileDetails(restaurantId);

		if (!result) {
			throw new RestaurantNotFoundError();
		}

		if (this.storageService) {
			if (result.profile?.avatarUpdatedAt) {
				try {
					const { downloadUrl } =
						await this.storageService.generatePresignedGetUrl({
							key: `restaurants/${restaurantId}/profile/avatar.png`,
						});
					result.profile.logo = downloadUrl;
				} catch {
					result.profile.logo = null;
				}
			} else if (
				result.profile?.logo &&
				!result.profile.logo.startsWith("http")
			) {
				try {
					const { downloadUrl } =
						await this.storageService.generatePresignedGetUrl({
							key: result.profile.logo,
						});
					result.profile.logo = downloadUrl;
				} catch {
					result.profile.logo = null;
				}
			} else if (result.profile) {
				result.profile.logo = null;
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
