import { inject, injectable } from "inversify";
import type {
	GetBatchRestaurantsInputDTO,
	RestaurantBatchItemDTO,
} from "@/application/dtos/internal/get-batch-restaurants.dto.ts";
import { GetBatchRestaurantsMapper } from "@/application/mappers/internal/get-batch-restaurants.mapper.ts";
import type { IGetBatchRestaurantsUseCase } from "@/application/ports/use-cases/internal/get-batch-restaurants.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";

@injectable()
export class GetBatchRestaurantsUseCase implements IGetBatchRestaurantsUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	async execute(
		input: GetBatchRestaurantsInputDTO,
	): Promise<RestaurantBatchItemDTO[]> {
		const uniqueIds = Array.from(
			new Set(input.restaurantIds.map((id) => id.trim())),
		).filter(Boolean);

		if (uniqueIds.length === 0) {
			return [];
		}

		const records = await this.restaurantRepository.findBatchByIds(uniqueIds);

		return GetBatchRestaurantsMapper.toDTOList(records);
	}
}
