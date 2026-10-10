import { inject, injectable } from "inversify";

import type {
  ListCustomerRestaurantsInputDto,
  PaginatedCustomerRestaurantsOutputDto,
} from "@/application/dtos/restaurant/customer-restaurant-listing.dto.ts";

import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import { TYPES } from "@/config/di/types.ts";

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
  ) {}

  public async execute(
    dto: ListCustomerRestaurantsInputDto,
  ): Promise<PaginatedCustomerRestaurantsOutputDto> {
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

    const data = restaurants.map((restaurant) => ({
      id: restaurant.id,
      restaurantName: restaurant.restaurantName,
      city: restaurant.city,
      state: restaurant.state,
      cuisineType: restaurant.cuisineType,
      averageCost: restaurant.averageCost,
      createdAt: restaurant.createdAt,
    }));

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
}