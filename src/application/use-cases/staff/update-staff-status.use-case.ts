import { inject, injectable } from "inversify";
import type {
	UpdateStaffStatusDTO,
	UpdateStaffStatusResponseDTO,
} from "@/application/dtos/staff/update-staff-status.dto.ts";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IUpdateStaffStatusUseCase } from "@/application/ports/use-cases/update-staff-status.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	InvalidStaffStatusError,
	RestaurantNotFoundError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

/**
 * Use case to activate or deactivate a staff member within a restaurant.
 *
 * Adheres to Clean Architecture and SOLID principles:
 * - Single Responsibility: Coordinates staff status transitions and access validation.
 * - Open/Closed: Relies on domain entities and status value objects for validation.
 * - Dependency Inversion: Depends exclusively on repository port interfaces.
 */
@injectable()
export class UpdateStaffStatusUseCase implements IUpdateStaffStatusUseCase {
	constructor(
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	/**
	 * Execute the status update flow.
	 *
	 * @param dto - Validated restaurantId, staffId, and desired status
	 * @returns Safe response DTO with updated status
	 */
	public async execute(
		dto: UpdateStaffStatusDTO,
	): Promise<UpdateStaffStatusResponseDTO> {
		const restaurantId = dto.restaurantId?.trim();
		const staffId = dto.staffId?.trim();
		const targetStatus = dto.status;

		if (targetStatus !== "ACTIVE" && targetStatus !== "INACTIVE") {
			throw new InvalidStaffStatusError(messages.INVALID_STAFF_STATUS);
		}

		const restaurant = await this.restaurantRepository.findById(restaurantId);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		const staff = await this.staffRepository.findByIdAndRestaurantId(
			staffId,
			restaurantId,
		);

		if (!staff) {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		if (staff.role !== "STAFF") {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		if (staff.status === targetStatus) {
			return StaffMapper.toStatusUpdateDTO(staff);
		}

		if (targetStatus === "ACTIVE") {
			staff.activate();
		} else {
			staff.deactivate();
		}

		const updatedStaff = await this.staffRepository.updateStatus(
			staffId,
			targetStatus,
		);

		return StaffMapper.toStatusUpdateDTO(updatedStaff);
	}
}
