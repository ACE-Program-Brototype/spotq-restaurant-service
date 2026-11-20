import type { CustomerRestaurantQueueStatusDTO } from "@/application/dtos/restaurant/customer-restaurant-details.dto.ts";

export interface GetRestaurantQueueStatusParams {
	restaurantId: string;
	userId?: string;
}

export interface IQueueService {
	getQueueStatus(
		params: GetRestaurantQueueStatusParams,
	): Promise<CustomerRestaurantQueueStatusDTO | null>;
}

