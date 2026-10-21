import { inject, injectable, optional } from "inversify";

import type {
	ListCustomerRestaurantsInputDTO,
	PaginatedCustomerRestaurantsOutputDTO,
} from "@/application/dtos/restaurant/customer-restaurant-listing.dto.ts";
import type { IStorageService } from "@/application/ports/services/storage.service.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";

@injectable()
export class ListCustomerRestaurantsUseCase {
	constructor(
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,

		@inject(TYPES.Services.Storage)
		@optional()
		private readonly storageService?: IStorageService,
	) {}

	public async execute(
		dto: ListCustomerRestaurantsInputDTO,
	): Promise<PaginatedCustomerRestaurantsOutputDTO> {
		const page =
			Number.isFinite(dto.page) && dto.page > 0
				? Math.floor(dto.page)
				: DEFAULT_PAGE;

		const limit =
			Number.isFinite(dto.limit) && dto.limit > 0
				? Math.min(Math.floor(dto.limit), MAX_LIMIT)
				: DEFAULT_LIMIT;

		const sortBy = dto.sortBy || DEFAULT_SORT_BY;
		const sortOrder = dto.sortOrder || DEFAULT_SORT_ORDER;

		const { restaurants, total } =
			await this.restaurantRepository.findCustomerRestaurants({
				...dto,
				page,
				limit,
				sortBy,
				sortOrder,
			});

		const totalPages = Math.ceil(total / limit);

		const data = await Promise.all(
			restaurants.map(async (restaurant) => ({
				id: restaurant.id,
				restaurantName: restaurant.restaurantName,
				city: restaurant.city,
				state: restaurant.state,
				cuisineType: restaurant.cuisineType,
				averageCost: restaurant.averageCost,
				coverImage: (await this.presignUrl(restaurant.coverImage)) ?? restaurant.coverImage,
				createdAt: restaurant.createdAt,
			}))
		);

		return {
			data,
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
		};
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
}
