import type {
	CustomerRestaurantDetailsInputDTO,
	CustomerRestaurantDetailsOutputDTO,
} from "@/application/dtos/restaurant/customer-restaurant-details.dto.ts";

export interface IGetCustomerRestaurantDetailsUseCase {
	execute(
		dto: CustomerRestaurantDetailsInputDTO,
	): Promise<CustomerRestaurantDetailsOutputDTO>;
}
