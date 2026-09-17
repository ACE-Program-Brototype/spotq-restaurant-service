import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import type { StaffStatus } from "@/domain/value-objects/staff-status.vo.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface StaffFilterParams {
	restaurantId: string;
	page: number;
	limit: number;
	status?: StaffStatus;
	search?: string;
	sortBy: "createdAt";
	sortOrder: "asc" | "desc";
}

export interface IRestaurantStaffRepository
	extends IBaseRepository<RestaurantStaff, string> {
	findByEmail(email: string): Promise<RestaurantStaff | null>;
	findByEmailAndRestaurantId(
		email: string,
		restaurantId: string,
	): Promise<RestaurantStaff | null>;
	findByRestaurantId(restaurantId: string): Promise<RestaurantStaff[]>;
	findManyWithFilters(
		params: StaffFilterParams,
	): Promise<{ staff: RestaurantStaff[]; total: number }>;
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
	removeStaff(id: string, restaurantId: string): Promise<void>;
	updateStaffInfo(
		id: string,
		data: { fullname?: string; phone?: string },
	): Promise<RestaurantStaff>;
	/**
	 * Update only the status of a staff member.
	 *
	 * @param id - Unique identifier of the staff member
	 * @param status - The new status ("ACTIVE" | "INACTIVE")
	 * @returns The updated RestaurantStaff entity
	 */
	updateStatus?(
		id: string,
		status: "ACTIVE" | "INACTIVE",
	): Promise<RestaurantStaff>;
}
