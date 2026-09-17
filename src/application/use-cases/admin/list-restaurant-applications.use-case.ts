import { inject, injectable } from "inversify";
import type {
	ListRestaurantApplicationsDto,
	PaginatedRestaurantApplicationsResponseDto,
} from "@/application/dtos/admin/list-restaurant-applications.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IListRestaurantApplicationsUseCase } from "@/application/ports/use-cases/admin/list-restaurant-applications.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";

@injectable()
export class ListRestaurantApplicationsUseCase
	implements IListRestaurantApplicationsUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(
		dto: ListRestaurantApplicationsDto,
	): Promise<PaginatedRestaurantApplicationsResponseDto> {
		const page = dto.page && dto.page > 0 ? dto.page : DEFAULT_PAGE;
		const limit = dto.limit && dto.limit > 0 ? dto.limit : DEFAULT_LIMIT;
		const sortBy = dto.sortBy || DEFAULT_SORT_BY;
		const sortOrder = dto.sortOrder || DEFAULT_SORT_ORDER;

		const { restaurants, total } =
			await this.restaurantRepository.findApplicationsWithFilters({
				page,
				limit,
				status: dto.status,
				search: dto.search?.trim(),
				fromDate: dto.fromDate,
				toDate: dto.toDate,
				sortBy,
				sortOrder,
			});

		const totalPages = Math.ceil(total / limit);

		return {
			restaurants,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			},
		};
	}
}
