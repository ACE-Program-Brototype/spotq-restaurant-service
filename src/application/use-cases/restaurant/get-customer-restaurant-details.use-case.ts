import { inject, injectable } from "inversify";
import type {
	CustomerRestaurantDetailsInputDTO,
	CustomerRestaurantDetailsOutputDTO,
} from "@/application/dtos/restaurant/customer-restaurant-details.dto.ts";
import { TYPES } from "@/config/di/types.ts";
import { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import { RestaurantNotFoundError } from "@/domain/errors/restaurant.errors.ts";
import type { IRestaurantRepository } from "@/domain/repositories/restaurant.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { CustomerRestaurantDetailsMapper } from "@application/mappers/customer-restaurant-details.mapper";

@injectable()
export class GetCustomerRestaurantDetailsUseCase {
	constructor(
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
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

		Restaurant.ensureCustomerAccess(record);

		return CustomerRestaurantDetailsMapper.toDTO(record, includeMenu);
	}
}
