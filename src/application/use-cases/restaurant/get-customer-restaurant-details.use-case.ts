
import { inject, injectable, optional } from "inversify";
import type {
	CustomerRestaurantDetailsInputDTO,
	CustomerRestaurantDetailsOutputDTO,
} from "@/application/dtos/restaurant/customer-restaurant-details.dto.ts";
import type { IStorageService } from "@/application/ports/services/storage.service.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type {
	CustomerRestaurantDetailsRecord,
	IRestaurantRepository,
} from "@/domain/repositories/restaurant.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { CustomerRestaurantDetailsMapper } from "@application/mappers/customer-restaurant-details.mapper";

@injectable()
export class GetCustomerRestaurantDetailsUseCase {
	constructor(
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,

		@inject(TYPES.Services.Storage)
		@optional()
		private readonly storageService?: IStorageService,
	) {}

	public async execute(
		dto: CustomerRestaurantDetailsInputDTO,
	): Promise<CustomerRestaurantDetailsOutputDTO> {
		const includeMenu = dto.includeMenu ?? true;

		const record =
			await this.restaurantRepository.findCustomerRestaurantDetails({
				restaurantId: dto.restaurantId,
				includeMenu,
				categoryId: dto.categoryId,
			});

		if (!record) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		this.ensureRestaurantIsEligible(record);

		const result = CustomerRestaurantDetailsMapper.toDTO(record, includeMenu);

		if (this.storageService) {
			result.coverImage = await this.presignUrl(result.coverImage);

			if (result.images && result.images.length > 0) {
				await Promise.all(
					result.images.map(async (img) => {
						img.objectKey = (await this.presignUrl(img.objectKey)) ?? img.objectKey;
					})
				);
			}

			if (result.menu && result.menu.length > 0) {
				await Promise.all(
					result.menu.map(async (cat) => {
						await Promise.all(
							cat.items.map(async (item) => {
								await Promise.all(
									(item.images || []).map(async (img) => {
										img.objectKey =
											(await this.presignUrl(img.objectKey)) ?? img.objectKey;
									})
								);
							})
						);
					})
				);
			}
		}

		return result;
	}

	private async presignUrl(key: string | null): Promise<string | null> {
		if (!key || key.startsWith("http") || !this.storageService) return key;
		try {
			const { downloadUrl } = await this.storageService.generatePresignedGetUrl({ key });
			return downloadUrl;
		} catch {
			return key;
		}
	}

	private ensureRestaurantIsEligible(
		record: CustomerRestaurantDetailsRecord,
	): void {
		const now = new Date();
		const isSubscriptionExpired =
			Boolean(record.subscriptionEndsAt && new Date(record.subscriptionEndsAt) <= now);

		if (
			record.status !== "ACTIVE" ||
			record.isBlocked ||
			!record.isSubscriptionActive ||
			isSubscriptionExpired ||
			record.onboardingStatus !== "COMPLETED"
		) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}
	}
}
