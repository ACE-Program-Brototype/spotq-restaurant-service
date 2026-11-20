import {
	StaffInactiveError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface";

/**
 * Throws an error if the staff don't have access to the restaurant
 * @param staffRepository StaffRepository
 * @param userId string
 * @param restaurantId string
 */
export async function ensureActiveRestaurantStaff(
	staffRepository: IRestaurantStaffRepository,
	userId: string,
	restaurantId: string,
): Promise<void> {
	const staff = await staffRepository.findByIdAndRestaurantId(
		userId,
		restaurantId,
	);

	if (!staff) {
		throw new StaffNotFoundError();
	}

	if (!staff.isActive()) {
		throw new StaffInactiveError();
	}
}
