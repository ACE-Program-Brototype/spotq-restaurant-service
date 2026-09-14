import type { RestaurantStaff } from "@/domain/entities/restaurant-staff.entity.ts";
import type { IBaseRepository } from "./base.repository.interface.ts";

export interface IRestaurantStaffRepository
	extends IBaseRepository<RestaurantStaff, string> {
	findByEmail(email: string): Promise<RestaurantStaff | null>;
	findByRestaurantId(restaurantId: string): Promise<RestaurantStaff[]>;
	findByIdAndRestaurantId(
		id: string,
		restaurantId: string,
	): Promise<RestaurantStaff | null>;
	updateStaffInfo(
		id: string,
		data: { fullname?: string; phone?: string },
	): Promise<RestaurantStaff>;
}
