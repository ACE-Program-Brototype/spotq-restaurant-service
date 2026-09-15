import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface IRestaurantStaffRepository
	extends IBaseRepository<RestaurantStaff, string> {
	findByEmail(email: string): Promise<RestaurantStaff | null>;
	findByRestaurantId(restaurantId: string): Promise<RestaurantStaff[]>;

	/**
	 * Find a staff member scoped strictly to a restaurant ID.
	 * Prevents cross-tenant entity leakage.
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
	 * Soft-removes a staff member belonging to a restaurant by setting their status to REMOVED.
	 *
	 * @param id - Unique identifier of the staff member
	 * @param restaurantId - Unique identifier of the restaurant
	 */
	removeStaff(id: string, restaurantId: string): Promise<void>;
}
