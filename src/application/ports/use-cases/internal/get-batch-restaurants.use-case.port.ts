import type {
	GetBatchRestaurantsInputDto,
	RestaurantBatchItemDto,
} from "@/application/dtos/internal/get-batch-restaurants.dto.ts";

export interface IGetBatchRestaurantsUseCase {
	execute(
		input: GetBatchRestaurantsInputDto,
	): Promise<RestaurantBatchItemDto[]>;
}
