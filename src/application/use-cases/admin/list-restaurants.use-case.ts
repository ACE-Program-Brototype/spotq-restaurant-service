import { inject, injectable } from "inversify";
import type {
	ListRestaurantsDTO,
	PaginatedRestaurantsResponseDTO,
} from "@/application/dtos/admin/list-restaurants.dto.ts";
import { RestaurantMapper } from "@/application/mappers/restaurant.mapper.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IListRestaurantsUseCase } from "@/application/ports/use-cases/list-restaurants.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";

@injectable()
export class ListRestaurantsUseCase implements IListRestaurantsUseCase {
	constructor(
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	public async execute(
		dto: ListRestaurantsDTO,
	): Promise<PaginatedRestaurantsResponseDTO> {
		const page = dto.page && dto.page > 0 ? dto.page : DEFAULT_PAGE;
		const limit = dto.limit && dto.limit > 0 ? dto.limit : DEFAULT_LIMIT;
		const sortBy = dto.sortBy || DEFAULT_SORT_BY;
		const sortOrder = dto.sortOrder || DEFAULT_SORT_ORDER;

		const { restaurants, total } =
			await this.restaurantRepository.findManyWithFilters({
				page,
				limit,
				search: dto.search?.trim(),
				status: dto.status,
				plan: dto.plan,
				isSubscriptionActive: dto.isSubscriptionActive,
				onboardingStatus: dto.onboardingStatus,
				createdFrom: dto.createdFrom,
				createdTo: dto.createdTo,
				sortBy,
				sortOrder,
			});

		const totalPages = Math.ceil(total / limit);

		return {
			restaurants: restaurants.map((r) => RestaurantMapper.toListItemDTO(r)),
			pagination: {
				page,
				limit,
				total,
				total_pages: totalPages,
				has_next_page: page < totalPages,
				has_prev_page: page > 1,
			},
		};
	}
}
