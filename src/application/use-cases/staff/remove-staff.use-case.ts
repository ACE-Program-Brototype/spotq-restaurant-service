import { inject, injectable } from "inversify";
import type { RemoveStaffDTO } from "@/application/dtos/staff/remove-staff.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IRemoveStaffUseCase } from "@/application/ports/use-cases/remove-staff.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	RestaurantNotFoundError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

/**
 * Use case to remove a staff member from a restaurant.
 *
 * Adheres strictly to Clean Architecture and SOLID principles:
 * - Single Responsibility Principle: Coordinates verification of restaurant existence,
 *   ownership scoping, staff role verification, and soft deletion.
 * - Open/Closed Principle: Uses domain entity and status value objects for business rule enforcement.
 * - Liskov Substitution Principle: Depends on repository abstractions (ports).
 * - Interface Segregation Principle: Implements a focused single-method use case interface.
 * - Dependency Inversion Principle: Relies exclusively on port interfaces resolved via DI.
 */
@injectable()
export class RemoveStaffUseCase implements IRemoveStaffUseCase {
	constructor(
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	/**
	 * Executes the removal process.
	 *
	 * 1. Validates the restaurant exists.
	 * 2. Scopes staff retrieval strictly to both staffId and restaurantId to prevent cross-tenant manipulation.
	 * 3. Asserts the account belongs to the restaurant, is a staff account, and is not already removed.
	 * 4. Soft-removes the staff record by marking status as REMOVED.
	 *
	 * @param dto - Scoped restaurantId and staffId
	 */
	public async execute(dto: RemoveStaffDTO): Promise<void> {
		const restaurantId = dto.restaurantId?.trim();
		const staffId = dto.staffId?.trim();

		// 1. Verify restaurant exists
		const restaurant = await this.restaurantRepository.findById(restaurantId);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		// 2. Verify staff exists and belongs to the requested restaurant
		const staff = await this.staffRepository.findByIdAndRestaurantId(
			staffId,
			restaurantId,
		);

		if (!staff) {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		// 3. Verify the account is a staff account
		if (staff.role !== "STAFF") {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		// 4. If staff member is already removed, return 404 as they no longer exist in active records
		if (staff.statusVO.isRemoved()) {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		// 5. Update domain model and persist soft removal
		staff.remove();
		await this.staffRepository.removeStaff(staffId, restaurantId);
	}
}
