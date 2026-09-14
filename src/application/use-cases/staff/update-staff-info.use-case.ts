import { inject, injectable } from "inversify";
import type {
	UpdateStaffInfoDTO,
	UpdateStaffInfoResponseDTO,
} from "@/application/dtos/staff/update-staff-info.dto.ts";
import { StaffMapper } from "@/application/mappers/staff.mapper.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port.ts";
import type { IUpdateStaffInfoUseCase } from "@/application/ports/use-cases/update-staff-info.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import {
	InvalidStaffDataError,
	RestaurantNotFoundError,
	StaffNotFoundError,
} from "@/domain/errors/staff.errors.ts";
import type { IRestaurantStaffRepository } from "@/domain/repositories/restaurant-staff.repository.interface.ts";
import { StaffPhone } from "@/domain/value-objects/phone.vo.ts";
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class UpdateStaffInfoUseCase implements IUpdateStaffInfoUseCase {
	constructor(
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepository: IRestaurantStaffRepository,
		@inject(TYPES.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,
	) {}

	public async execute(
		dto: UpdateStaffInfoDTO,
	): Promise<UpdateStaffInfoResponseDTO> {
		const restaurantId = dto.restaurantId?.trim();
		const staffId = dto.staffId?.trim();

		if (dto.name === undefined && dto.phone === undefined) {
			throw new InvalidStaffDataError(messages.AT_LEAST_ONE_FIELD_REQUIRED);
		}

		/**
		 * 1. Verify that the restaurant exists in the system
		 */
		const restaurant = await this.restaurantRepository.findById(restaurantId);
		if (!restaurant) {
			throw new RestaurantNotFoundError(messages.RESTAURANT_NOT_FOUND);
		}

		/**
		 * 2. Find the staff member belonging to the requested restaurant
		 */
		const staff = await this.staffRepository.findByIdAndRestaurantId(
			staffId,
			restaurantId,
		);

		if (!staff) {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		/**
		 * 3. Validate that the target account is a staff account
		 */
		if (staff.role !== "STAFF") {
			throw new StaffNotFoundError(messages.STAFF_NOT_FOUND);
		}

		/**
		 * 4. Validate, trim, and normalize allowed update fields
		 */
		let finalName: string | undefined;
		if (dto.name !== undefined) {
			const trimmed = dto.name.trim();
			if (trimmed.length < 2 || trimmed.length > 100) {
				throw new InvalidStaffDataError(messages.FULLNAME_INVALID);
			}
			finalName = trimmed;
		}

		let finalPhone: string | undefined;
		if (dto.phone !== undefined) {
			finalPhone = StaffPhone.create(dto.phone).value;
		}

		/**
		 * 5. Update only the allowed fields (fullname and/or phone) at the database level
		 */
		const updatedStaff = await this.staffRepository.updateStaffInfo(staffId, {
			fullname: finalName,
			phone: finalPhone,
		});

		/**
		 * 6. Return a safe response DTO without exposing sensitive credentials or internal fields
		 */
		return StaffMapper.toUpdateStaffInfoDTO(updatedStaff);
	}
}
