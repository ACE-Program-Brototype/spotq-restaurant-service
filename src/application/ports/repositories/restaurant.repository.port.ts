import type { CreateRestaurantDto } from "@/application/dtos/restaurant/restaurant-onboarding.dto.ts";
import type { IBaseRepository } from "@/application/ports/repositories/base.repository.port";
import type { Restaurant } from "@/domain/entities/restaurant.entity";
import type { RestaurantStatus } from "@/domain/value-objects/restaurant-status.vo.ts";
import type { SubscriptionPlan } from "@/domain/value-objects/subscription-plan.vo.ts";

export interface RestaurantFilterParams {
	page: number;
	limit: number;
	search?: string;
	status?: RestaurantStatus;
	plan?: SubscriptionPlan;
	isSubscriptionActive?: boolean;
	createdFrom?: Date;
	createdTo?: Date;
	sortBy: string;
	sortOrder: "asc" | "desc";
}

export interface IRestaurantRepository extends IBaseRepository<Restaurant> {
	existsByEmail(email: string): Promise<boolean>;

	createRestaurant(data: CreateRestaurantDto): Promise<Restaurant>;

	findByEmail(email: string): Promise<Restaurant | null>;

	findManyWithFilters(
		params: RestaurantFilterParams,
	): Promise<{ restaurants: Restaurant[]; total: number }>;
}
