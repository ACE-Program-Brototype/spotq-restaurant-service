import type { RemoveStaffDTO } from "@/application/dtos/staff/remove-staff.dto.ts";

/**
 * Port interface for the Remove Staff Member use case.
 * Defines the contract for removing a staff member from a restaurant.
 */
export interface IRemoveStaffUseCase {
	/**
	 * Executes the removal of a staff member.
	 *
	 * @param dto - Scoped restaurantId and staffId
	 * @returns Promise resolving to void upon successful removal
	 */
	execute(dto: RemoveStaffDTO): Promise<void>;
}
