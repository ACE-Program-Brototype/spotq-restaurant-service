import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface IRestaurantStaffRepository
	extends IBaseRepository<RestaurantStaff, string> {
	findByEmail(email: string): Promise<RestaurantStaff | null>;
	findByRestaurantId(restaurantId: string): Promise<RestaurantStaff[]>;
	/**
	 * Find a staff member strictly belonging to the specified restaurant.
	 *
	 * @param id - Unique identifier of the staff member
	 * @param restaurantId - Unique identifier of the restaurant
	 * @returns The RestaurantStaff entity if found and matching restaurantId, otherwise null
	 */
	findByIdAndRestaurantId(
		id: string,
		restaurantId: string,
	): Promise<RestaurantStaff | null>;

	/**
	 * Update only the status of a staff member.
	 *
	 * @param id - Unique identifier of the staff member
	 * @param status - The new status ("ACTIVE" | "INACTIVE")
	 * @returns The updated RestaurantStaff entity
	 */
	updateStatus(
		id: string,
		status: "ACTIVE" | "INACTIVE",
	): Promise<RestaurantStaff>;
}
