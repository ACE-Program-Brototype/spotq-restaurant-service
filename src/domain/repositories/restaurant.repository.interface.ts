import type { Restaurant } from "@/domain/entities/restaurant.entity.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface IRestaurantRepository
	extends IBaseRepository<Restaurant, string> {
	existsByEmail(email: string): Promise<boolean>;
	findByEmail(email: string): Promise<Restaurant | null>;
}
