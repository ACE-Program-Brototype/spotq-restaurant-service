import type {
	GetBatchRestaurantsInputDTO,
	RestaurantBatchItemDTO,
} from "@/application/dtos/internal/get-batch-restaurants.dto.ts";

export interface IGetBatchRestaurantsUseCase {
	execute(
		input: GetBatchRestaurantsInputDTO,
	): Promise<RestaurantBatchItemDTO[]>;
}
