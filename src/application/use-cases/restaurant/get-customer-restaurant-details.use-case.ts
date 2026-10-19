
import { inject, injectable } from "inversify";
import type {
  CustomerRestaurantDetailsInputDTO,
  CustomerRestaurantDetailsOutputDTO,
} from "@/application/dtos/restaurant/customer-restaurant-details.dto.ts";
import { TYPES } from "@/config/di/types.ts";
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

    const result =
      await this.restaurantRepository.findCustomerRestaurantDetails({
        restaurantId: dto.restaurantId,
        includeMenu,
        categoryId: dto.categoryId,
      });

    if (!result) {
      throw new RestaurantNotFoundError(
        messages.RESTAURANT_NOT_FOUND,
      );
    }

    result.restaurant.ensureCustomerAccess();

    return CustomerRestaurantDetailsMapper.toDTO(
      result.details,
      includeMenu,
    );
  }
}
